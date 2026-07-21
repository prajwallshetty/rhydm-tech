import Link from "next/link";
import { Calendar, ChevronDown, TrendingUp, ArrowUpRight } from "lucide-react";

export default function AdminDashboardPage() {
  const kpiCards = [
    {
      title: "Total Sales",
      value: "₹12,45,230",
      change: "18.6%",
      period: "vs last week",
      isPositive: true,
      sparkline: "M0 25 C10 22, 20 28, 30 18 C40 10, 50 15, 60 5 C70 12, 80 8, 90 2",
    },
    {
      title: "Orders",
      value: "1,248",
      change: "14.3%",
      period: "vs last week",
      isPositive: true,
      sparkline: "M0 22 C10 18, 20 24, 30 14 C40 20, 50 10, 60 12 C70 4, 80 8, 90 3",
    },
    {
      title: "Customers",
      value: "8,632",
      change: "11.2%",
      period: "vs last week",
      isPositive: true,
      sparkline: "M0 20 C10 25, 20 18, 30 22 C40 12, 50 16, 60 8 C70 10, 80 4, 90 2",
    },
    {
      title: "Conversion Rate",
      value: "3.42%",
      change: "7.5%",
      period: "vs last week",
      isPositive: true,
      sparkline: "M0 24 C10 20, 20 22, 30 15 C40 18, 50 12, 60 14 C70 6, 80 8, 90 4",
    },
    {
      title: "Average Order Value",
      value: "₹9,980",
      change: "9.8%",
      period: "vs last week",
      isPositive: true,
      sparkline: "M0 22 C10 25, 20 20, 30 16 C40 22, 50 10, 60 12 C70 4, 80 8, 90 2",
    },
  ];

  const topProducts = [
    { name: "Dell Latitude 5420", sold: "412 Sold", revenue: "₹41,20,000", slug: "dell-latitude-7440-i7-16gb" },
    { name: "MacBook Air M1", sold: "368 Sold", revenue: "₹36,80,000", slug: "apple-macbook-pro-14-m3" },
    { name: "HP EliteBook 840 G7", sold: "297 Sold", revenue: "₹27,60,000", slug: "hp-z2-tower-g9-workstation" },
    { name: "Lenovo ThinkPad T14", sold: "246 Sold", revenue: "₹22,10,000", slug: "dell-latitude-7440-i7-16gb" },
    { name: "iPad Air 5th Gen", sold: "198 Sold", revenue: "₹17,80,000", slug: "apple-macbook-pro-14-m3" },
  ];

  const recentOrders = [
    { id: "#ORD-8756", customer: "Rohit Sharma", amount: "₹45,999", status: "Delivered", date: "May 26, 2024" },
    { id: "#ORD-8755", customer: "Neha Verma", amount: "₹28,499", status: "Shipped", date: "May 26, 2024" },
    { id: "#ORD-8754", customer: "Arjun Mehta", amount: "₹66,999", status: "Processing", date: "May 25, 2024" },
    { id: "#ORD-8753", customer: "Priya Nair", amount: "₹18,999", status: "Pending", date: "May 25, 2024" },
    { id: "#ORD-8752", customer: "Vikram Singh", amount: "₹39,499", status: "Delivered", date: "May 24, 2024" },
  ];

  const categorySales = [
    { name: "Laptops", amount: "₹6,20,000", percentage: "49.8%", color: "#2E6F40" },
    { name: "Desktops", amount: "₹2,40,000", percentage: "19.3%", color: "#4CAF50" },
    { name: "Servers", amount: "₹1,60,000", percentage: "12.9%", color: "#81C784" },
    { name: "Accessories", amount: "₹1,25,000", percentage: "10.0%", color: "#A5D6A7" },
    { name: "Others", amount: "₹50,230", percentage: "4.0%", color: "#C8E6C9" },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Top Greeting & Date Picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, Admin 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Here&rsquo;s what&rsquo;s happening with your store today.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card px-4 py-2 text-xs font-bold text-slate-700 dark:text-foreground shadow-xs hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto">
          <Calendar className="size-3.5 text-slate-500" />
          <span>May 20 &ndash; May 26, 2024</span>
          <ChevronDown className="size-3.5 text-slate-400" />
        </button>
      </div>

      {/* Top 5 KPI Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-border dark:bg-card hover:shadow-md transition-shadow"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-muted-foreground">
                {card.title}
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
                {card.value}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                <span>&uarr; {card.change}</span>
                <span className="text-slate-400 font-normal">{card.period}</span>
              </div>

              {/* Sparkline SVG */}
              <svg className="h-6 w-16 overflow-visible" viewBox="0 0 90 30">
                <path
                  d={card.sparkline}
                  fill="none"
                  stroke="#2E6F40"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row — Sales Overview & Top Selling Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Sales Overview Area Chart (Left 7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Sales Overview
            </h2>
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-muted/50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-foreground">
              <span>This Week</span>
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>
          </div>

          {/* Area Chart SVG */}
          <div className="relative w-full h-64 flex flex-col justify-between pt-4">
            {/* Horizontal Grid lines */}
            {["₹20L", "₹15L", "₹10L", "₹5L", "₹0"].map((val, idx) => (
              <div key={idx} className="relative flex items-center text-[10px] text-slate-400 font-medium">
                <span className="w-10 shrink-0">{val}</span>
                <div className="w-full border-b border-slate-100 dark:border-border/50" />
              </div>
            ))}

            {/* SVG Line & Gradient Fill */}
            <div className="absolute inset-0 pl-10 pt-2 pb-6">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E6F40" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2E6F40" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <path
                  d="M0 160 Q 100 80, 200 120 T 400 40 T 600 70 T 700 60 L 700 200 L 0 200 Z"
                  fill="url(#salesGrad)"
                />

                {/* Line Stroke */}
                <path
                  d="M0 160 Q 100 80, 200 120 T 400 40 T 600 70 T 700 60"
                  fill="none"
                  stroke="#2E6F40"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {[
                  { x: 0, y: 160 },
                  { x: 116, y: 78 },
                  { x: 233, y: 118 },
                  { x: 350, y: 88 },
                  { x: 466, y: 40 },
                  { x: 583, y: 70 },
                  { x: 700, y: 60 },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="4.5" fill="#2E6F40" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>
            </div>
          </div>

          {/* X Axis Dates */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-3 pl-10">
            <span>May 20</span>
            <span>May 21</span>
            <span>May 22</span>
            <span>May 23</span>
            <span>May 24</span>
            <span>May 25</span>
            <span>May 26</span>
          </div>
        </div>

        {/* Top Selling Products List (Right 5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-border/60 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Top Selling Products
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#2E6F40] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {topProducts.map((prod, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg bg-slate-100 dark:bg-muted border border-slate-200/60 dark:border-border shrink-0 flex items-center justify-center p-1">
                    <img
                      src="/hero.png"
                      alt=""
                      className="size-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {prod.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {prod.sold}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                  {prod.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row — Recent Orders Table & Sales by Category Donut Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Recent Orders Table (Left 7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-4 mb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-[#2E6F40] hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-border/60 text-[11px] font-bold text-slate-400">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border/40">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-muted/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{order.id}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{order.customer}</td>
                    <td className="py-3 font-black text-slate-900 dark:text-white">{order.amount}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold ${
                          order.status === "Delivered"
                            ? "bg-[#E8F5E9] text-[#2E6F40]"
                            : order.status === "Shipped"
                            ? "bg-[#E3F2FD] text-blue-600"
                            : order.status === "Processing"
                            ? "bg-[#FFF8E1] text-amber-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500 font-medium">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Category Donut Chart (Right 5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-border dark:bg-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-border/60 pb-3 mb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Sales by Category
            </h2>
            <Link href="/admin/categories" className="text-xs font-bold text-[#2E6F40] hover:underline">
              View All
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* Donut SVG with Center Total Text */}
            <div className="relative size-44 shrink-0 flex items-center justify-center">
              <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E8F5E9"
                  strokeWidth="4"
                />
                {/* Donut Segments */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#2E6F40"
                  strokeWidth="4.5"
                  strokeDasharray="49.8, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="4.5"
                  strokeDasharray="19.3, 100"
                  strokeDashoffset="-49.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#81C784"
                  strokeWidth="4.5"
                  strokeDasharray="12.9, 100"
                  strokeDashoffset="-69.1"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">₹12,45,230</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2.5 w-full">
              {categorySales.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-slate-800 dark:text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 font-medium">{cat.amount}</span>
                    <span className="font-bold text-slate-900 dark:text-white w-10 text-right">{cat.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
