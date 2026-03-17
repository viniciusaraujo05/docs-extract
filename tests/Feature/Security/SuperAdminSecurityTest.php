<?php

namespace Tests\Feature\Security;

use App\Models\SuperAdminSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_setup_is_disabled_by_default(): void
    {
        $response = $this->get('/admin-030399');

        $response->assertStatus(200);

        $page = $response->viewData('page');
        $this->assertSame('disabled', $page['props']['mode']);
    }

    public function test_super_admin_setup_requires_explicit_enablement(): void
    {
        config(['super_admin.allow_local_setup' => true]);

        $response = $this->post('/admin-030399/setup', [
            'password' => 'super-secret',
            'password_confirmation' => 'super-secret',
        ]);

        $response->assertRedirect('/admin-030399');
        $this->assertTrue(SuperAdminSetting::hasPassword());
    }
}
