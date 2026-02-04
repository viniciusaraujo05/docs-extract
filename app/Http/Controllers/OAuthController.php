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
use Laravel\Passport\Bridge\User as PassportUser;
use Illuminate\Support\Str;
use League\OAuth2\Server\Exception\OAuthServerException as LeagueException;
use Laravel\Passport\Exceptions\OAuthServerException as PassportException;
use Illuminate\Support\Facades\Log;

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
        try {
            return $this->withErrorHandling(function () use ($psrRequest, $request, $psrResponse) {
                $authRequest = $this->server->validateAuthorizationRequest($psrRequest);

                if ($this->guard->guest()) {
                    return $this->promptForLogin($request);
                }

                $user = $this->guard->user();
                $authRequest->setUser(new PassportUser($user->getAuthIdentifier()));

                $scopes = $this->parseScopes($authRequest);
                $client = $this->clients->find($authRequest->getClient()->getIdentifier());

                if (! $client) {
                    return abort(404, 'Client not found');
                }

                if ($request->input('prompt') !== 'consent' &&
                    ($client->skipsAuthorization($user, $scopes) || $this->hasGrantedScopes($user, $client, $scopes))) {
                    return $this->approveRequest($authRequest, $psrResponse);
                }

                $request->session()->put('authToken', $authToken = Str::random());
                $request->session()->put('authRequest', $authRequest);

                return Inertia::render('auth/authorize', [
                    'client' => $client,
                    'user' => $user,
                    'scopes' => $scopes,
                    'authToken' => $authToken,
                    'request' => $request->all(),
                ])->toResponse($request);
            });
        } catch (LeagueException $e) {
            return $this->handleOAuthError($e, $request);
        } catch (PassportException $e) {
            return $this->handleOAuthError($e, $request);
        } catch (\Throwable $e) {
            Log::error('[OAuth] Unexpected Exception: ' . $e->getMessage(), ['exception' => $e]);
            return Inertia::render('auth/login', [
                'error' => 'Erro inesperado na autenticação: ' . $e->getMessage(),
                'locale' => app()->getLocale(),
            ])->toResponse($request);
        }
    }

    private function handleOAuthError($e, Request $request)
    {
        Log::warning('[OAuth] Validation Error: ' . $e->getMessage());
        
        return Inertia::render('auth/login', [
            'error' => 'Erro de validação OAuth: ' . $e->getMessage(),
            'locale' => app()->getLocale(),
        ])->toResponse($request);
    }
}
