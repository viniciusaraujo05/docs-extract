<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Passport\Http\Controllers\AuthorizationController as PassportAuthorizationController;
use Psr\Http\Message\ResponseInterface as PsrResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Laravel\Passport\Contracts\AuthorizationViewResponse;
use Symfony\Component\HttpFoundation\Response;

class OAuthController extends PassportAuthorizationController
{
    /**
     * Authorize a client to access the user's account.
     *
     * @param  \Psr\Http\Message\ServerRequestInterface  $psrRequest
     * @param  \Illuminate\Http\Request  $request
     * @param  \Psr\Http\Message\ResponseInterface  $psrResponse
     * @param  \Laravel\Passport\Contracts\AuthorizationViewResponse  $viewResponse
     * @return \Symfony\Component\HttpFoundation\Response|\Laravel\Passport\Contracts\AuthorizationViewResponse
     */
    public function authorize(
        ServerRequestInterface $psrRequest,
        Request $request,
        PsrResponseInterface $psrResponse,
        AuthorizationViewResponse $viewResponse
    ): Response|AuthorizationViewResponse {
        return $this->withErrorHandling(function () use ($psrRequest, $request) {
            $authRequest = $this->server->validateAuthorizationRequest($psrRequest);

            $scopes = $this->parseScopes($authRequest);

            $token = $request->user()->tokens()
                ->where('client_id', $authRequest->getClient()->getIdentifier())
                ->where('revoked', false)
                ->where('expires_at', '>', now())
                ->first();

            // If the user has already authorized the client, just approve it
            if ($token) {
                return $this->approveRequest($authRequest, $request->user());
            }

            return Inertia::render('auth/authorize', [
                'client' => [
                    'id' => $authRequest->getClient()->getIdentifier(),
                    'name' => $authRequest->getClient()->getName(),
                ],
                'user' => [
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ],
                'scopes' => $scopes,
                'request' => $request->all(),
            ]);
        });
    }
}
