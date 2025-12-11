<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\CheckoutController;
use App\Http\Controllers\API\MenuItemController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\ReviewController;

/*
| PUBLIC ROUTES (TIDAK PERLU LOGIN)
*/

// MIDTRANS WEBHOOK (PUBLIC)
Route::post('/midtrans/webhook', [PaymentController::class, 'updatePaymentStatus']);

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Menu Items
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/menu-items/{id}', [MenuItemController::class, 'show']);
Route::get('/menu-items/category/{categoryId}', [MenuItemController::class, 'getByCategory']);

// Review (PUBLIC GET)
Route::get('/reviews/menu-item/{menuItemId}', [ReviewController::class, 'getByMenuItem']);

/*
| PROTECTED ROUTES (HARUS LOGIN)
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Categories (Admin Only)
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Menu Items (Admin Only)
    Route::get('/admin/menu-items', [MenuItemController::class, 'adminIndex']);
    Route::post('/admin/menu-items', [MenuItemController::class, 'store']);
    Route::put('/admin/menu-items/{id}', [MenuItemController::class, 'update']);
    Route::delete('/admin/menu-items/{id}', [MenuItemController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::patch('/payments/{id}/status', [PaymentController::class, 'updateStatus']);
    Route::get('/payments/order/{orderId}', [PaymentController::class, 'getByOrder']);
    Route::post('/payment/update-status', [PaymentController::class, 'updatePaymentStatus']);


    // Reviews (POST/UPDATE/DELETE – hanya user login)
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('/reviews/user/me', [ReviewController::class, 'getByUser']);

    // Checkout
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read/{id}', [NotificationController::class, 'markAsRead']);
});
