import { NextResponse } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '../../../../../../lib/supabase-auth';
import { getSupabase } from '../../../../../../lib/supabase';

// POST /api/admin/items/match - Find potential matches between lost and found items
export async function POST(request) {
  try {
    const { itemId, type } = await request.json();
    
    if (!itemId || !type) {
      return createErrorResponse('Item ID and type (lost/found) are required', 400);
    }
    
    const supabase = getSupabase();
    
    // Get the source item
    const { data: sourceItem, error: sourceError } = await supabase
      .from('lost_items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (sourceError || !sourceItem) {
      return createErrorResponse('Item not found', 404);
    }
    
    // Find potential matches based on type
    let matchQuery = supabase
      .from('lost_items')
      .select('*')
      .neq('id', itemId);
    
    if (type === 'lost') {
      // Looking for found items that match this lost item
      matchQuery = matchQuery.eq('status', 'found');
    } else if (type === 'found') {
      // Looking for lost items that match this found item
      matchQuery = matchQuery.eq('status', 'lost');
    }
    
    // Apply category filter
    matchQuery = matchQuery.eq('category', sourceItem.category);
    
    const { data: potentialMatches, error: matchError } = await matchQuery;
    
    if (matchError) {
      console.error('Database error:', matchError);
      throw new Error('Failed to find matches');
    }
    
    // Score and rank matches based on similarity
    const scoredMatches = potentialMatches.map(match => {
      let score = 0;
      let reasons = [];
      
      // Category match (already filtered)
      score += 30;
      reasons.push('Same category');
      
      // Color match
      if (sourceItem.color && match.color && 
          sourceItem.color.toLowerCase() === match.color.toLowerCase()) {
        score += 20;
        reasons.push('Same color');
      }
      
      // Brand match
      if (sourceItem.brand && match.brand && 
          sourceItem.brand.toLowerCase() === match.brand.toLowerCase()) {
        score += 20;
        reasons.push('Same brand');
      }
      
      // Location proximity (simple string matching)
      if (sourceItem.location_lost && match.location_found) {
        const sourceLoc = sourceItem.location_lost.toLowerCase();
        const matchLoc = match.location_found.toLowerCase();
        if (sourceLoc.includes(matchLoc) || matchLoc.includes(sourceLoc)) {
          score += 15;
          reasons.push('Similar location');
        }
      }
      
      // Date proximity (within 7 days)
      if (sourceItem.date_lost && match.date_found) {
        const daysDiff = Math.abs(
          (new Date(sourceItem.date_lost) - new Date(match.date_found)) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= 7) {
          score += 15;
          reasons.push(`Date within ${Math.floor(daysDiff)} days`);
        }
      }
      
      // Description keyword matching (simple)
      if (sourceItem.description && match.description) {
        const sourceWords = sourceItem.description.toLowerCase().split(/\s+/);
        const matchWords = match.description.toLowerCase().split(/\s+/);
        const commonWords = sourceWords.filter(word => 
          word.length > 3 && matchWords.includes(word)
        );
        if (commonWords.length > 0) {
          score += Math.min(commonWords.length * 5, 20);
          reasons.push(`${commonWords.length} common words in description`);
        }
      }
      
      return {
        ...match,
        matchScore: score,
        matchReasons: reasons,
        isHighMatch: score >= 60,
        isMediumMatch: score >= 40 && score < 60,
        isLowMatch: score < 40
      };
    });
    
    // Sort by score (highest first)
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
    
    return createSuccessResponse({
      sourceItem: {
        id: sourceItem.id,
        name: sourceItem.name,
        category: sourceItem.category,
        type: type
      },
      matches: scoredMatches,
      totalMatches: scoredMatches.length,
      highMatches: scoredMatches.filter(m => m.isHighMatch).length,
      mediumMatches: scoredMatches.filter(m => m.isMediumMatch).length,
      lowMatches: scoredMatches.filter(m => m.isLowMatch).length
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(error.message || 'Failed to find matches', 500);
  }
}
