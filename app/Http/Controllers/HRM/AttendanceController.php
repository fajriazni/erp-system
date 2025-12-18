<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        // For now, assume authenticated user is linked to an employee
        // In reality, we might look up auth()->user()->employee_id
        // But for simplicity/admin view, we list all.
        
        $attendances = Attendance::with('employee')
            ->when($request->date, function ($query, $date) {
                return $query->whereDate('date', $date);
            }, function ($query) {
                return $query->whereDate('date', Carbon::today());
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('HRM/Attendance/Index', [
            'attendances' => $attendances,
            'filters' => $request->only(['date']),
        ]);
    }

    public function store(Request $request)
    {
        // Simple clock in/out simulation for ANY employee (Admin function)
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|in:clock_in,clock_out',
            'time' => 'required', // HH:mm
            'date' => 'required|date',
        ]);

        $attendance = Attendance::firstOrCreate(
            [
                'employee_id' => $request->employee_id,
                'date' => $request->date,
            ],
            ['status' => 'present']
        );

        if ($request->type === 'clock_in') {
            $attendance->update(['clock_in' => $request->time]);
        } else {
            $attendance->update(['clock_out' => $request->time]);
        }

        return redirect()->back()->with('success', 'Attendance updated.');
    }

    public function leave(Request $request)
    {
        $leaves = LeaveRequest::with(['employee', 'approver'])
            ->latest()
            ->paginate(20);

        return Inertia::render('HRM/Attendance/Leave', [
            'leaves' => $leaves,
        ]);
    }
}
