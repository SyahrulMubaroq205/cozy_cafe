<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\MenuItem;
use App\Models\Review;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $customer1 = User::where('email', 'budi@example.com')->first();
        $customer2 = User::where('email', 'siti@example.com')->first();

        $kopi = MenuItem::where('name', 'Kopi Susu')->first();
        $teh = MenuItem::where('name', 'Es Teh Manis')->first();
        $pisangGoreng = MenuItem::where('name', 'Pisang Goreng')->first();
        $nasiGoreng = MenuItem::where('name', 'Nasi Goreng Spesial')->first();
        $latte = MenuItem::where('name', 'Caffe Latte')->first();

        $reviews = [
            [
                'user_id' => $customer1->id,
                'menu_item_id' => $kopi->id,
                'rating' => 5,
                'comment' => 'Kopi susu nya enak banget! Manisnya pas.',
            ],
            [
                'user_id' => $customer1->id,
                'menu_item_id' => $pisangGoreng->id,
                'rating' => 4,
                'comment' => 'Crispy dan enak, tapi porsinya agak kecil.',
            ],
            [
                'user_id' => $customer1->id,
                'menu_item_id' => $teh->id,
                'rating' => 5,
                'comment' => 'Segar banget, cocok untuk cuaca panas.',
            ],
            [
                'user_id' => $customer2->id,
                'menu_item_id' => $nasiGoreng->id,
                'rating' => 5,
                'comment' => 'Nasi goreng terenak yang pernah saya coba!',
            ],
            [
                'user_id' => $customer2->id,
                'menu_item_id' => $latte->id,
                'rating' => 4,
                'comment' => 'Latte nya smooth, tapi harganya agak mahal.',
            ],
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }

        echo "✓ Reviews seeded successfully!\n";
    }
}
