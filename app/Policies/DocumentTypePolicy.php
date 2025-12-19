<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\DocumentType;
use App\Models\User;

/**
 * Policy para autorização de tipos de documentos.
 */
final class DocumentTypePolicy
{
    /**
     * Verifica se o utilizador pode ver a lista.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Verifica se o utilizador pode ver o tipo.
     */
    public function view(User $user, DocumentType $documentType): bool
    {
        return $user->id === $documentType->user_id;
    }

    /**
     * Verifica se o utilizador pode criar.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Verifica se o utilizador pode atualizar.
     */
    public function update(User $user, DocumentType $documentType): bool
    {
        return $user->id === $documentType->user_id;
    }

    /**
     * Verifica se o utilizador pode eliminar.
     */
    public function delete(User $user, DocumentType $documentType): bool
    {
        return $user->id === $documentType->user_id;
    }
}
