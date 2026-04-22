<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = App\Models\User::where('name', 'like', '%adam medd%')->first();
if ($user) {
    if ($user->client) {
        $reqs = App\Models\BookingRequest::where('client_id', $user->client->id)->get();
        echo json_encode(['status' => 'User and client exists', 'reqs' => $reqs], JSON_PRETTY_PRINT);
    } else {
        echo json_encode(['status' => 'User exists but no client profile attached']);
    }
} else {
    echo "User Adam Medd not found.\n";
}
