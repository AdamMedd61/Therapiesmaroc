<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/register', 'POST', [
    'name' => 'Therapist Doc',
    'email' => 'doc@gmail.com',
    'password' => 'password12345',
    'role' => 'therapist',
    'CIN' => 'DOC123',
    'location' => null
]);
$request->headers->set('Accept', 'application/json');

try {
    $response = $kernel->handle($request);
    echo "STATUS: " . $response->getStatusCode() . "\n";
    echo "BODY: " . substr($response->getContent(), 0, 500) . "\n";
} catch (\Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo "IN " . $e->getFile() . " LINE " . $e->getLine() . "\n";
}
