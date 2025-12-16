<?php

use App\Http\Controllers\Master\CategoryController;
use App\Http\Controllers\Master\ContactController;
use App\Http\Controllers\Master\ProductController;
use App\Http\Controllers\Master\RoleController;
use App\Http\Controllers\Master\UomController;
use App\Http\Controllers\Master\UserController;
use App\Http\Controllers\Master\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('products', ProductController::class);
    Route::resource('contacts', ContactController::class);
    Route::resource('uoms', UomController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('warehouses', WarehouseController::class);
    Route::resource('roles', RoleController::class);
});
