<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Minuman',
                'description' => 'Berbagai jenis minuman segar',
                'image' => 'https://via.placeholder.com/300x200?text=Minuman',
                'is_active' => true,
            ],
            [
                'name' => 'Makanan',
                'description' => 'Menu makanan lezat',
                'image' => 'https://via.placeholder.com/300x200?text=Makanan',
                'is_active' => true,
            ],
            [
                'name' => 'Snack',
                'description' => 'Camilan ringan',
                'image' => 'https://via.placeholder.com/300x200?text=Snack',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        echo "✓ Categories seeded successfully!\n";
    }
}
