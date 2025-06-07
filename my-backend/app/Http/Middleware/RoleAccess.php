<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleAccess
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if (!$user->role) {
            return response()->json(['message' => 'User has no role assigned'], 403);
        }
        if (!isset($user->role->name)) {
            return response()->json(['message' => 'User role name not set'], 403);
        }
        if (!in_array($user->role->name, $roles)) {
            return response()->json(['message' => 'Access denied'], 403);
        }
        return $next($request);
    }
}
