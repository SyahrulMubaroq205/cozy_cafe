<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\MenuItem;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $beverages = Category::where('name', 'Minuman')->first();
        $foods = Category::where('name', 'Makanan')->first();
        $snacks = Category::where('name', 'Snack')->first();

        // Menu Items - Minuman
        $beverageItems = [
            [
                'category_id' => $beverages->id,
                'name' => 'Kopi Susu',
                'description' => 'Kopi susu dengan gula aren',
                'price' => 15000,
                'image' => 'https://picsum.photos/200/300',
                'stock' => 50,
                'is_available' => true,
            ],
            [
                'category_id' => $beverages->id,
                'name' => 'Es Teh Manis',
                'description' => 'Teh manis dingin menyegarkan',
                'price' => 8000,
                'image' => 'https://via.placeholder.com/300x300?text=Es+Teh',
                'stock' => 100,
                'is_available' => true,
            ],
            [
                'category_id' => $beverages->id,
                'name' => 'Jus Alpukat',
                'description' => 'Jus alpukat segar',
                'price' => 18000,
                'image' => 'https://via.placeholder.com/300x300?text=Jus+Alpukat',
                'stock' => 30,
                'is_available' => true,
            ],
            [
                'category_id' => $beverages->id,
                'name' => 'Caffe Latte',
                'description' => 'Espresso dengan susu steamed',
                'price' => 25000,
                'image' => 'https://via.placeholder.com/300x300?text=Latte',
                'stock' => 40,
                'is_available' => true,
            ],
        ];

        // Menu Items - Makanan
        $foodItems = [
            [
                'category_id' => $foods->id,
                'name' => 'Nasi Goreng Spesial',
                'description' => 'Nasi goreng dengan telur dan ayam',
                'price' => 25000,
                'image' => 'https://via.placeholder.com/300x300?text=Nasi+Goreng',
                'stock' => 25,
                'is_available' => true,
            ],
            [
                'category_id' => $foods->id,
                'name' => 'Mie Goreng',
                'description' => 'Mie goreng pedas',
                'price' => 20000,
                'image' => 'https://via.placeholder.com/300x300?text=Mie+Goreng',
                'stock' => 30,
                'is_available' => true,
            ],
            [
                'category_id' => $foods->id,
                'name' => 'Chicken Sandwich',
                'description' => 'Sandwich ayam dengan sayuran segar',
                'price' => 22000,
                'image' => 'https://via.placeholder.com/300x300?text=Sandwich',
                'stock' => 20,
                'is_available' => true,
            ],
            [
                'category_id' => $foods->id,
                'name' => 'Spaghetti Aglio Olio',
                'description' => 'Pasta dengan bawang putih dan cabai',
                'price' => 30000,
                'image' => 'https://via.placeholder.com/300x300?text=Pasta',
                'stock' => 15,
                'is_available' => true,
            ],
        ];

        // Menu Items - Snack
        $snackItems = [
            [
                'category_id' => $snacks->id,
                'name' => 'Pisang Goreng',
                'description' => 'Pisang goreng crispy',
                'price' => 12000,
                'image' => 'https://via.placeholder.com/300x300?text=Pisang+Goreng',
                'stock' => 40,
                'is_available' => true,
            ],
            [
                'category_id' => $snacks->id,
                'name' => 'French Fries',
                'description' => 'Kentang goreng dengan saus',
                'price' => 15000,
                'image' => 'https://via.placeholder.com/300x300?text=French+Fries',
                'stock' => 50,
                'is_available' => true,
            ],
            [
                'category_id' => $snacks->id,
                'name' => 'Chocolate Cake',
                'description' => 'Kue coklat lembut',
                'price' => 18000,
                'image' => 'https://via.placeholder.com/300x300?text=Chocolate+Cake',
                'stock' => 20,
                'is_available' => true,
            ],
        ];

        // Insert all menu items
        foreach ($beverageItems as $item) {
            MenuItem::create($item);
        }

        foreach ($foodItems as $item) {
            MenuItem::create($item);
        }

        foreach ($snackItems as $item) {
            MenuItem::create($item);
        }

        echo "✓ Menu items seeded successfully!\n";
    }
}
