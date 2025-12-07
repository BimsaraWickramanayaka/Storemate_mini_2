<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class CreateTenant extends Command
{
    protected $signature = 'tenant:create {id} {domain}';
    protected $description = 'Create a new tenant with a domain';

    public function handle()
    {
        $tenantId = $this->argument('id');
        $domain = $this->argument('domain');

        try {
            $tenant = Tenant::create(['id' => $tenantId]);
            $tenant->domains()->create(['domain' => $domain]);
            
            $this->info(" Tenant '{$tenantId}' created with domain '{$domain}'");
            $this->info("   Database: tenant{$tenantId}");
            $this->info("   Accessible at: http://{$domain}:8000");
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error(" Error: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
