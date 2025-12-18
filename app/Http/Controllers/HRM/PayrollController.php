<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\PayrollRun;
use App\Models\Employee;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index()
    {
        $runs = PayrollRun::latest()->paginate(10);
        return Inertia::render('HRM/Payroll/Index', [
            'runs' => $runs,
        ]);
    }

    public function create()
    {
        return Inertia::render('HRM/Payroll/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'pay_date' => 'required|date|after_or_equal:period_end',
        ]);

        DB::transaction(function () use ($request) {
            $run = PayrollRun::create([
                'period_start' => $request->period_start,
                'period_end' => $request->period_end,
                'pay_date' => $request->pay_date,
                'status' => 'draft',
            ]);

            // Simple generation logic: Fixed salary for everyone
            $employees = Employee::where('status', 'active')->get();
            $totalAmount = 0;

            foreach ($employees as $employee) {
                // Placeholder logic: Basic salary 5000, Tax 10%
                $basic = 5000.00;
                $gross = $basic;
                $deduction = $basic * 0.10;
                $net = $gross - $deduction;

                Payslip::create([
                    'payroll_run_id' => $run->id,
                    'employee_id' => $employee->id,
                    'basic_salary' => $basic,
                    'allowances' => [],
                    'deductions' => ['tax' => $deduction],
                    'gross_salary' => $gross,
                    'total_deductions' => $deduction,
                    'net_salary' => $net,
                ]);

                $totalAmount += $net;
            }

            $run->update(['total_amount' => $totalAmount]);
        });

        return redirect()->route('hrm.payroll.index')->with('success', 'Payroll run generated.');
    }

    public function show(PayrollRun $payroll)
    {
        $payroll->load(['payslips.employee']);
        return Inertia::render('HRM/Payroll/Show', [
            'payroll' => $payroll,
        ]);
    }
}
