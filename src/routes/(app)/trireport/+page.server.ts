// src/routes/(dashboard)/dashboard/report/+page.server.ts
import type { PageServerLoad } from './$types';
import { BASE_URL, APIKEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { pageAuth } from '$lib/pageAuth';

// Monthly sales report.
// - "Numero corsi" / "Incassi corsi": count + income of orders where type === 'course'
// - "Numero Altro" / "Incassi Altro": count + income of all other order types
// Only orders with payment.statusPayment: 'done' are counted.
// Year is selected via the "year" query param (defaults to the current year); ?year=2025 reruns this load.

const MONTH_LABELS = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre'
];

type MonthlyRow = {
    monthNum: number;
    label: string;
    courseCount: number;
    courseIncome: number;
    otherCount: number;
    otherIncome: number;
};

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
    pageAuth(url.pathname, locals.auth, 'page');

    const currentYear = new Date().getFullYear();
    const selectedYear = Number(url.searchParams.get('year')) || currentYear;

    let monthlyReport: MonthlyRow[] = [];

    try {
        const resFetch = await fetch(`${BASE_URL}/api/mongo/aggregate`, {
            method: 'POST',
            body: JSON.stringify({
                apiKey: APIKEY,
                schema: 'order', // product | order | user | layout | discount
                pipeline: [
                    {
                        $match: {
                            'payment.statusPayment': 'done',
                            $expr: { $eq: [{ $year: '$orderDate' }, selectedYear] }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                month: { $month: '$orderDate' },
                                category: { $cond: [{ $eq: ['$type', 'course'] }, 'course', 'other'] }
                            },
                            count: { $sum: 1 },
                            income: { $sum: '$totalValue' }
                        }
                    }
                ]
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!resFetch.ok) {
            const errorText = await resFetch.text();
            console.error('report aggregate failed', resFetch.status, errorText);
            throw error(400, errorText);
        }

        const aggregateResult: {
            _id: { month: number; category: 'course' | 'other' };
            count: number;
            income: number;
        }[] = await resFetch.json();

        monthlyReport = MONTH_LABELS.map((label, idx) => {
            const monthNum = idx + 1;
            const courseData = aggregateResult.find((r) => r._id.month === monthNum && r._id.category === 'course');
            const otherData = aggregateResult.find((r) => r._id.month === monthNum && r._id.category === 'other');

            return {
                monthNum,
                label,
                courseCount: courseData?.count || 0,
                courseIncome: courseData?.income || 0,
                otherCount: otherData?.count || 0,
                otherIncome: otherData?.income || 0
            };
        });
    } catch (err) {
        console.error('report load error:', err);
        throw error(500, 'Server error');
    }

    const totals = monthlyReport.reduce(
        (acc, m) => ({
            courseCount: acc.courseCount + m.courseCount,
            courseIncome: acc.courseIncome + m.courseIncome,
            otherCount: acc.otherCount + m.otherCount,
            otherIncome: acc.otherIncome + m.otherIncome
        }),
        { courseCount: 0, courseIncome: 0, otherCount: 0, otherIncome: 0 }
    );

    return {
        monthlyReport,
        totals,
        selectedYear,
        auth: locals.auth
    };
};