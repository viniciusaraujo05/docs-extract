<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function __construct(
        private readonly Dispatcher $events
    ) {
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $supportedLocales = config('app.available_locales', ['pt', 'en']);

        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email:rfc,dns',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'locale' => ['nullable', 'string', Rule::in($supportedLocales)],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'locale' => $input['locale'] ?? config('app.locale', 'pt'),
        ]);

        $this->events->dispatch(new Registered($user));

        return $user;
    }
}
