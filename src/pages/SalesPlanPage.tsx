import React, { useMemo, useState } from 'react';
import Header from '../components/layout/Header';
import { Card, Select, AchievementBadge, GrowthIndicator } from '../components/ui/index';
import { salesPlans } from '../data/mockData';

const SalesPlanPage: React.FC = () => {
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [tapFilter, setTapFilter] = useState<string>('');

    // Filter data
    const filteredData = useMemo(() => {
        return salesPlans.filter(plan => {
            if (categoryFilter && plan.category !== categoryFilter) return false;
            if (tapFilter && plan.tap !== tapFilter) return false;
            return true;
        });
    }, [categoryFilter, tapFilter]);

    // Group by salesforce
    const groupedBySalesforce = useMemo(() => {
        const groups: Record<string, typeof salesPlans> = {};

        filteredData.forEach(plan => {
            if (!groups[plan.salesforceId]) {
                groups[plan.salesforceId] = [];
            }
            groups[plan.salesforceId].push(plan);
        });

        return Object.entries(groups).map(([sfId, plans]) => ({
            salesforceId: sfId,
            salesforceName: plans[0].salesforceName,
            tap: plans[0].tap,
            perdanaPlans: plans.filter(p => p.category === 'perdana'),
            voucherPlans: plans.filter(p => p.category === 'voucher'),
            cvmPlans: plans.filter(p => p.category === 'cvm'),
        }));
    }, [filteredData]);

    // Get unique TAPs
    const tapOptions = useMemo(() => {
        const unique = [...new Set(salesPlans.map(p => p.tap))];
        return [{ value: '', label: 'All TAP' }, ...unique.map(t => ({ value: t, label: t }))];
    }, []);

    // Calculate totals for a category
    const calculateCategoryTotal = (plans: typeof salesPlans) => {
        const target = plans.reduce((sum, p) => sum + p.targetM, 0);
        const actualM = plans.reduce((sum, p) => sum + p.actualM, 0);
        const actualM1 = plans.reduce((sum, p) => sum + p.actualM1, 0);
        const achievement = target > 0 ? (actualM / target) * 100 : 0;
        const momGrowth = actualM1 > 0 ? ((actualM - actualM1) / actualM1) * 100 : 0;

        return { target, actualM, actualM1, achievement, momGrowth };
    };

    // Summary stats
    const summary = useMemo(() => {
        const perdanaPlans = filteredData.filter(p => p.category === 'perdana');
        const voucherPlans = filteredData.filter(p => p.category === 'voucher');
        const cvmPlans = filteredData.filter(p => p.category === 'cvm');

        return {
            perdana: calculateCategoryTotal(perdanaPlans),
            voucher: calculateCategoryTotal(voucherPlans),
            cvm: calculateCategoryTotal(cvmPlans),
        };
    }, [filteredData]);

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Sales Plan"
                subtitle="Track Perdana, Voucher, and CVM performance"
            />

            {/* Filters */}
            <Card padding="md" className="mt-6 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-48">
                        <Select
                            label="Category"
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Categories' },
                                { value: 'perdana', label: 'Perdana' },
                                { value: 'voucher', label: 'Voucher' },
                                { value: 'cvm', label: 'CVM' },
                            ]}
                        />
                    </div>
                    <div className="w-48">
                        <Select
                            label="TAP"
                            value={tapFilter}
                            onChange={e => setTapFilter(e.target.value)}
                            options={tapOptions}
                        />
                    </div>
                    {(categoryFilter || tapFilter) && (
                        <button
                            onClick={() => {
                                setCategoryFilter('');
                                setTapFilter('');
                            }}
                            className="btn btn-ghost text-sm"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </Card>

            {/* Category Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card padding="md" className="border-l-4 border-l-[#F13B4B]">
                    <h4 className="font-semibold text-gray-900 mb-3">Perdana</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Target</span>
                            <span className="text-sm font-medium">{summary.perdana.target.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Actual (M)</span>
                            <span className="text-sm font-semibold">{summary.perdana.actualM.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Achievement</span>
                            <AchievementBadge value={summary.perdana.achievement} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">MoM</span>
                            <GrowthIndicator value={summary.perdana.momGrowth} />
                        </div>
                    </div>
                </Card>

                <Card padding="md" className="border-l-4 border-l-[#3B82F6]">
                    <h4 className="font-semibold text-gray-900 mb-3">Voucher</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Target</span>
                            <span className="text-sm font-medium">{summary.voucher.target.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Actual (M)</span>
                            <span className="text-sm font-semibold">{summary.voucher.actualM.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Achievement</span>
                            <AchievementBadge value={summary.voucher.achievement} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">MoM</span>
                            <GrowthIndicator value={summary.voucher.momGrowth} />
                        </div>
                    </div>
                </Card>

                <Card padding="md" className="border-l-4 border-l-[#10B981]">
                    <h4 className="font-semibold text-gray-900 mb-3">CVM</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Target</span>
                            <span className="text-sm font-medium">{summary.cvm.target.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Actual (M)</span>
                            <span className="text-sm font-semibold">{summary.cvm.actualM.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Achievement</span>
                            <AchievementBadge value={summary.cvm.achievement} />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">MoM</span>
                            <GrowthIndicator value={summary.cvm.momGrowth} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Complex Matrix Table */}
            <Card padding="none" className="overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Sales Plan Matrix</h3>
                    <p className="text-sm text-gray-500">Detailed tracking by Salesforce</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Multi-level headers */}
                        <thead>
                            <tr className="bg-gray-100">
                                <th rowSpan={2} className="px-4 py-2 text-left text-xs font-semibold text-white uppercase border-b border-r border-gray-200 sticky left-0 bg-gray-100 min-w-[150px]">
                                    Salesforce
                                </th>
                                <th rowSpan={2} className="px-4 py-2 text-center text-xs font-semibold text-white uppercase border-b border-r border-gray-200 min-w-[80px]">
                                    TAP
                                </th>
                                {/* Perdana Group */}
                                <th colSpan={5} className="px-4 py-2 text-center text-xs font-semibold text-[#F13B4B] uppercase border-b border-r border-gray-200 bg-red-50">
                                    Perdana
                                </th>
                                {/* Voucher Group */}
                                <th colSpan={5} className="px-4 py-2 text-center text-xs font-semibold text-[#3B82F6] uppercase border-b border-r border-gray-200 bg-blue-50">
                                    Voucher
                                </th>
                                {/* CVM Group */}
                                <th colSpan={5} className="px-4 py-2 text-center text-xs font-semibold text-[#10B981] uppercase border-b border-gray-200 bg-green-50">
                                    CVM
                                </th>
                            </tr>
                            <tr className="bg-[#3d5f85]">
                                {/* Perdana sub-headers */}
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">Target</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">M-1</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">M</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">Achv%</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-r border-gray-200">MoM%</th>
                                {/* Voucher sub-headers */}
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">Target</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">M-1</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">M</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">Achv%</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-r border-gray-200">MoM%</th>
                                {/* CVM sub-headers */}
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">Target</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">M-1</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">M</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">Achv%</th>
                                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200">MoM%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedBySalesforce.slice(0, 20).map((sf, idx) => {
                                const perdana = calculateCategoryTotal(sf.perdanaPlans);
                                const voucher = calculateCategoryTotal(sf.voucherPlans);
                                const cvm = calculateCategoryTotal(sf.cvmPlans);

                                return (
                                    <tr key={sf.salesforceId} className={`border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-25'} hover:bg-gray-50`}>
                                        <td className="px-4 py-3 font-medium text-gray-900 sticky left-0 bg-inherit border-r border-gray-100">
                                            {sf.salesforceName}
                                        </td>
                                        <td className="px-4 py-3 text-center border-r border-gray-100">
                                            <span className="text-xs font-medium text-[#1E3A5F] bg-blue-50 px-2 py-1 rounded">
                                                {sf.tap}
                                            </span>
                                        </td>
                                        {/* Perdana data */}
                                        <td className="px-2 py-3 text-center text-sm">{perdana.target.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center text-sm text-gray-500">{perdana.actualM1.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center text-sm font-medium">{perdana.actualM.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center"><AchievementBadge value={perdana.achievement} /></td>
                                        <td className="px-2 py-3 text-center border-r border-gray-100"><GrowthIndicator value={perdana.momGrowth} size="sm" /></td>
                                        {/* Voucher data */}
                                        <td className="px-2 py-3 text-center text-sm">{voucher.target.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center text-sm text-gray-500">{voucher.actualM1.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center text-sm font-medium">{voucher.actualM.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center"><AchievementBadge value={voucher.achievement} /></td>
                                        <td className="px-2 py-3 text-center border-r border-gray-100"><GrowthIndicator value={voucher.momGrowth} size="sm" /></td>
                                        {/* CVM data */}
                                        <td className="px-2 py-3 text-center text-sm">{cvm.target.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center text-sm text-gray-500">{cvm.actualM1.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center text-sm font-medium">{cvm.actualM.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-center"><AchievementBadge value={cvm.achievement} /></td>
                                        <td className="px-2 py-3 text-center"><GrowthIndicator value={cvm.momGrowth} size="sm" /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination info */}
                <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
                    Showing {Math.min(20, groupedBySalesforce.length)} of {groupedBySalesforce.length} salesforce
                </div>
            </Card>
        </div>
    );
};

export default SalesPlanPage;
