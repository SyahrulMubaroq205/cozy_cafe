<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    // Ambil semua review (untuk admin)
    public function index()
    {
        $reviews = Review::with(['user', 'menuItem'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    // Simpan / Update review
    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_item_id' => 'required|exists:menu_items,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        // Pastikan user terautentikasi
        $user = Auth::guard('sanctum')->user() ?? $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized user',
            ], 401);
        }

        // Cek apakah user sudah review menu tersebut
        $existingReview = Review::where('user_id', $user->id)
            ->where('menu_item_id', $validated['menu_item_id'])
            ->first();

        if ($existingReview) {
            $existingReview->update([
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review updated successfully',
                'data' => $existingReview->load(['user', 'menuItem']),
            ]);
        }

        // Simpan review baru
        $review = Review::create([
            'user_id' => $user->id,
            'menu_item_id' => $validated['menu_item_id'],
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review created successfully',
            'data' => $review->load(['user', 'menuItem']),
        ]);
    }

    // Tampilkan detail review
    public function show($id)
    {
        $review = Review::with(['user', 'menuItem'])->find($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $review,
        ]);
    }

    // Update review (khusus user sendiri)
    public function update(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user() ?? $request->user();

        $review = Review::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found or unauthorized',
            ], 404);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $review->load(['user', 'menuItem']),
        ]);
    }

    // Hapus review (user sendiri)
    public function destroy(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user() ?? $request->user();

        $review = Review::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found or unauthorized',
            ], 404);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully',
        ]);
    }

    // Review berdasarkan menu item (untuk halaman customer)
    public function getByMenuItem($menuItemId)
    {
        $menuItem = MenuItem::find($menuItemId);

        if (!$menuItem) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found',
            ], 404);
        }

        $reviews = Review::with('user')
            ->where('menu_item_id', $menuItemId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews, // array langsung
            'average_rating' => round($reviews->avg('rating'), 1),
            'total_reviews' => $reviews->count(),
        ]);
    }

    // Review berdasarkan user login
    public function getByUser(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? $request->user();

        $reviews = Review::with('menuItem')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }
}
