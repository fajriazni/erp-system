<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Attendance;
use Illuminate\Support\Carbon;

test('can view attendance', function () {
    $user = User::factory()->create();
    $dept = Department::factory()->create();
    $employee = Employee::factory()->for($dept)->create();
    
    Attendance::create([
        'employee_id' => $employee->id,
        'date' => Carbon::today(),
        'status' => 'present'
    ]);

    $response = $this->actingAs($user)->get(route('hrm.attendance.index'));

    $response->assertStatus(200);
});

test('can clock in', function () {
    $user = User::factory()->create();
    $dept = Department::factory()->create();
    $employee = Employee::factory()->for($dept)->create();

    $response = $this->actingAs($user)->post(route('hrm.attendance.store'), [
        'employee_id' => $employee->id,
        'type' => 'clock_in',
        'date' => '2025-01-01',
        'time' => '09:00'
    ]);

    $response->assertRedirect();
    
    $this->assertDatabaseHas('attendances', [
        'employee_id' => $employee->id,
        // 'date' => '2025-01-01',
    ]);
});
