<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['department', 'manager'])->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return Inertia::render('HRM/Employees/Index', [
            'employees' => $query->paginate(20)->withQueryString(),
            'departments' => Department::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'department_id'])
        ]);
    }

    public function create()
    {
        return Inertia::render('HRM/Employees/Create', [
            'departments' => Department::select('id', 'name')->get(),
            'managers' => Employee::select('id', 'first_name', 'last_name')->get(),
            'users' => User::doesntHave('employee')->select('id', 'name')->get(), // Only users without employee record
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'employee_id' => 'required|string|unique:employees,employee_id',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'job_title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'manager_id' => 'nullable|exists:employees,id',
            'user_id' => 'nullable|exists:users,id|unique:employees,user_id',
            'join_date' => 'required|date',
            'status' => 'required|in:active,on_leave,terminated',
            'gender' => 'nullable|in:male,female',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
        ]);

        Employee::create($validated);

        return redirect()->route('hrm.employees.index')->with('success', 'Employee registered successfully.');
    }

    public function show(Employee $employee)
    {
        $employee->load(['department', 'manager', 'subordinates', 'user']);
        
        return Inertia::render('HRM/Employees/Show', [
            'employee' => $employee
        ]);
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('HRM/Employees/Edit', [
            'employee' => $employee,
            'departments' => Department::select('id', 'name')->get(),
            'managers' => Employee::where('id', '!=', $employee->id)->select('id', 'first_name', 'last_name')->get(),
            'users' => User::where(function($q) use ($employee) {
                $q->doesntHave('employee')->orWhere('id', $employee->user_id);
            })->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'employee_id' => ['required', 'string', Rule::unique('employees')->ignore($employee->id)],
            'email' => ['required', 'email', Rule::unique('employees')->ignore($employee->id)],
            'phone' => 'nullable|string|max:20',
            'job_title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'manager_id' => 'nullable|exists:employees,id',
            'user_id' => ['nullable', 'exists:users,id', Rule::unique('employees')->ignore($employee->id)],
            'join_date' => 'required|date',
            'status' => 'required|in:active,on_leave,terminated',
            'gender' => 'nullable|in:male,female',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
        ]);

        $employee->update($validated);

        return redirect()->route('hrm.employees.index')->with('success', 'Employee updated successfully.');
    }
}
