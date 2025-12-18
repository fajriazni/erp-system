<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;

test('can view employee list', function () {
    $user = User::factory()->create();
    Employee::factory()->count(3)->for(Department::factory()->create())->create();

    $response = $this->actingAs($user)->get(route('hrm.employees.index'));

    $response->assertStatus(200);
});

test('can create employee', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();
    $manager = Employee::factory()->for($department)->create();

    $response = $this->actingAs($user)->post(route('hrm.employees.store'), [
        'first_name' => 'John',
        'last_name' => 'Doe',
        'employee_id' => 'EMP-TEST-001',
        'email' => 'john.doe@example.com',
        'job_title' => 'Developer',
        'department_id' => $department->id,
        'manager_id' => $manager->id,
        'join_date' => '2025-01-01',
        'status' => 'active',
    ]);

    $response->assertRedirect(route('hrm.employees.index'));
    
    $this->assertDatabaseHas('employees', [
        'email' => 'john.doe@example.com',
        'employee_id' => 'EMP-TEST-001',
        'department_id' => $department->id,
    ]);
});
