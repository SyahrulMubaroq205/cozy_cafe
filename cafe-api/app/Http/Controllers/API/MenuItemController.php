<?php

namespace App\Http\Controllers\API;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MenuItemController
{
    // CUSTOMER - hanya lihat menu tersedia
    public function index()
    {
        $menuItems = MenuItem::with(['category'])
            ->withAvg('reviews', 'rating')
            ->where('is_available', true)
            ->get()
            ->map(function ($item) {
                $item->average_rating = round($item->reviews_avg_rating ?? 0, 1);
                $item->total_reviews = $item->reviews()->count();
                unset($item->reviews_avg_rating);
                return $item;
            });

        return response()->json(['success' => true, 'data' => $menuItems]);
    }

    // ADMIN - lihat semua menu
    public function adminIndex()
    {
        $menuItems = MenuItem::with(['category'])
            ->withAvg('reviews', 'rating')
            ->get()
            ->map(function ($item) {
                $item->average_rating = round($item->reviews_avg_rating ?? 0, 1);
                $item->total_reviews = $item->reviews()->count();
                unset($item->reviews_avg_rating);
                return $item;
            });

        return response()->json(['success' => true, 'data' => $menuItems]);
    }

    // SHOW SINGLE MENU ITEM
    public function show($id)
    {
        $menuItem = MenuItem::with(['category', 'reviews.user'])
            ->withAvg('reviews', 'rating')
            ->find($id);

        if (!$menuItem) {
            return response()->json(['success' => false, 'message' => 'Menu item not found'], 404);
        }

        $menuItem->average_rating = round($menuItem->reviews_avg_rating ?? 0, 1);
        $menuItem->total_reviews = $menuItem->reviews->count();
        unset($menuItem->reviews_avg_rating);

        return response()->json(['success' => true, 'data' => $menuItem]);
    }

    // STORE NEW MENU ITEM (ADMIN)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable',
            'stock' => 'required|integer|min:0',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->has('is_available')) {
            $data['is_available'] = filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('menu_images', 'public');
            $data['image'] = asset('storage/' . $path);
        } elseif ($request->filled('image') && filter_var($request->image, FILTER_VALIDATE_URL)) {
            $data['image'] = $request->image;
        }

        $menuItem = MenuItem::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Menu item created successfully',
            'data' => $menuItem->load('category')
        ], 201);
    }

    // UPDATE MENU ITEM (ADMIN)
    public function update(Request $request, $id)
    {
        $menuItem = MenuItem::find($id);
        if (!$menuItem) {
            return response()->json(['success' => false, 'message' => 'Menu item not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'image' => 'nullable',
            'stock' => 'sometimes|integer|min:0',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->has('is_available')) {
            $data['is_available'] = filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            if ($menuItem->image && str_contains($menuItem->image, 'storage/')) {
                $oldPath = str_replace(asset('storage') . '/', '', $menuItem->image);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('menu_images', 'public');
            $data['image'] = asset('storage/' . $path);
        } elseif ($request->filled('image') && filter_var($request->image, FILTER_VALIDATE_URL)) {
            $data['image'] = $request->image;
        }

        $menuItem->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully',
            'data' => $menuItem->load('category')
        ]);
    }

    // DELETE MENU ITEM
    public function destroy($id)
    {
        $menuItem = MenuItem::find($id);
        if (!$menuItem) {
            return response()->json(['success' => false, 'message' => 'Menu item not found'], 404);
        }

        if ($menuItem->image && str_contains($menuItem->image, 'storage/')) {
            $oldPath = str_replace(asset('storage') . '/', '', $menuItem->image);
            Storage::disk('public')->delete($oldPath);
        }

        $menuItem->delete();

        return response()->json(['success' => true, 'message' => 'Menu item deleted successfully']);
    }

    // GET MENU BY CATEGORY
    public function getByCategory($categoryId)
    {
        $menuItems = MenuItem::where('category_id', $categoryId)
            ->where('is_available', true)
            ->with(['category'])
            ->withAvg('reviews', 'rating')
            ->get()
            ->map(function ($item) {
                $item->average_rating = round($item->reviews_avg_rating ?? 0, 1);
                $item->total_reviews = $item->reviews()->count();
                unset($item->reviews_avg_rating);
                return $item;
            });

        return response()->json(['success' => true, 'data' => $menuItems]);
    }
}
