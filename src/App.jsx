import React, { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, RotateCcw, Check, Flame, ExternalLink, Package, UtensilsCrossed } from 'lucide-react';

const LEAD_TIME_DAYS = 2;

const ITEMS = [
  { id: 'hetbap', name: '햇반', unit: '개', fullStock: 36, dailyUse: 2, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuyrS2P3A' },
  { id: 'chicken', name: '닭가슴살', unit: '팩', fullStock: 24, dailyUse: 2, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuAv6vEpo' },
  { id: 'beef', name: '우둔살', unit: '팩', fullStock: 20, dailyUse: 1, baseThreshold: 5, link: 'https://link.coupang.com/a/dGuDttnF5o' },
  { id: 'yogurt', name: '그릭요거트', unit: 'g', fullStock: 1000, dailyUse: 100, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuEtLjxca' },
  { id: 'banana', name: '바나나', unit: 'g', fullStock: 1000, dailyUse: 100, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuFEDhz52' },
  { id: 'bread', name: '식빵', unit: 'g', fullStock: 660, dailyUse: 80, baseThreshold: 2, link: 'https://link.coupang.com/a/dGuGCkCpA4' },
  { id: 'veggies', name: '냉동 야채', unit: 'g', fullStock: 3000, dailyUse: 100, baseThreshold: 5, link: 'https://link.coupang.com/a/dGuUGTcIMe' },
  { id: 'pb', name: '땅콩버터', unit: 'g', fullStock: 450, dailyUse: 20, baseThreshold: 5, link: 'https://link.coupang.com/a/dGuCcMHoSi' },
  { id: 'almond', name: '아몬드', unit: 'g', fullStock: 1000, dailyUse: 10, baseThreshold: 10, link: 'https://link.coupang.com/a/dGuWWEnuvI' },
  { id: 'protein', name: '프로틴 (매스게이너)', unit: 'g', fullStock: 5000, dailyUse: 30, baseThreshold: 14, link: 'https://www.myprotein.co.kr/p/sports-nutrition/impact-whey-mass-gainer/10529988/?variation=11372978' }
].map(i => ({ ...i, thresholdDays: i.baseThreshold + LEAD_TIME_DAYS }));

const MEAL_PLAN = [
  {
    id: 'postworkout',
    label: '운동 후',
    items: [
      { name: '오넛티 땅콩버터', amount: '20g' },
      { name: '식빵', amount: '2조각' },
      { name: '랩노쉬 쉐이크', amount: '1잔' }
    ]
  },
  {
    id: 'meal1',
    label: 'MEAL 1',
    items: [
      { name: '햇반', amount: '210g' },
      { name: '닭가슴살', amount: '200g' }
    ]
  },
  {
    id: 'meal2',
    label: 'MEAL 2',
    items: [
      { name: '햇반', amount: '210g' },
      { name: '우둔살', amount: '200g' }
    ]
  },
  {
    id: 'meal3',
    label: 'MEAL 3',
    items: [
      { name: '그릭요거트', amount: '100g' },
      { name: '아몬드', amount: '10g' },
      { name: '바나나', amount: '100g' }
    ]
  }
];

const ANYTIME = [
  { name: '야채 하루', amount: '100g' },
  { name: '김치, 김', amount: '섭취 가능' }
];

const MACROS = { carb: 250, protein: 155, fat: 50, kcal: 2100 };

const storage = {
  get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); }
  }
};

function formatNum(n, unit) {
  if (unit === 'g') return Math.round(n).toLocaleString();
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

function getStreak(log) {
  if (!log || log.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (log.includes(toDateStr(d))) streak++;
    else break;
  }
  return streak;
}

function getWeekDays() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function MealApp() {
  const [tab, setTab] = useState('plan');
  const [stocks, setStocks] = useState(() => {
    const saved = storage.get('meal-stock-v2');
    if (saved) return saved;
    const init = {};
    ITEMS.forEach(i => init[i.id] = i.fullStock);
    return init;
  });
  const [log, setLog] = useState(() => storage.get('meal-log-v2') || []);
  const [mealCheck, setMealCheck] = useState(() => {
    return storage.get(`meal-check-${toDateStr(new Date())}`) || {};
  });

  function saveStocks(newStocks) {
    setStocks(newStocks);
    storage.set('meal-stock-v2', newStocks);
  }
  function saveLog(newLog) {
    setLog(newLog);
    storage.set('meal-log-v2', newLog);
  }
  function saveMealCheck(newCheck) {
    setMealCheck(newCheck);
    storage.set(`meal-check-${toDateStr(new Date())}`, newCheck);
  }

  function days(item) {
    const s = stocks[item.id] ?? item.fullStock;
    return s / item.dailyUse;
  }
  function status(item) {
    const d = days(item);
    if (d <= item.thresholdDays) return 'reorder';
    if (d <= item.thresholdDays * 1.5) return 'warning';
    return 'good';
  }
  function adjust(item, delta) {
    const current = stocks[item.id] ?? item.fullStock;
    const newVal = Math.max(0, Math.round((current + delta) * 10) / 10);
    saveStocks({ ...stocks, [item.id]: newVal });
  }
  function refill(item) { saveStocks({ ...stocks, [item.id]: item.fullStock }); }

  function consumeAll() {
    const newStocks = { ...stocks };
    ITEMS.forEach(item => {
      const cur = newStocks[item.id] ?? item.fullStock;
      newStocks[item.id] = Math.max(0, cur - item.dailyUse);
    });
    saveStocks(newStocks);
    const today = toDateStr(new Date());
    if (!log.includes(today)) saveLog([...log, today].sort());
    const allChecked = {};
    MEAL_PLAN.forEach(m => allChecked[m.id] = true);
    saveMealCheck(allChecked);
  }

  function undoToday() {
    const today = toDateStr(new Date());
    saveLog(log.filter(d => d !== today));
    const newStocks = { ...stocks };
    ITEMS.forEach(item => {
      const cur = newStocks[item.id] ?? 0;
      newStocks[item.id] = Math.min(item.fullStock, cur + item.dailyUse);
    });
    saveStocks(newStocks);
    saveMealCheck({});
  }

  function toggleMeal(mealId) {
    saveMealCheck({ ...mealCheck, [mealId]: !mealCheck[mealId] });
  }

  const reorderItems = ITEMS.filter(i => status(i) === 'reorder');
  const today = toDateStr(new Date());
  const completedToday = log.includes(today);
  const streak = getStreak(log);
  const weekDays = getWeekDays();
  const weekCompleted = weekDays.filter(d => log.includes(toDateStr(d))).length;
  const todayIdx = (() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  })();
  const mealsCompleted = MEAL_PLAN.filter(m => mealCheck[m.id]).length;

  return (
    <div className="bg-zinc-950 text-white min-h-screen pb-32" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", system-ui, sans-serif' }}>
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
        <div className="px-5 pt-12 pb-3 flex gap-2">
          <button
            onClick={() => setTab('plan')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-colors ${
              tab === 'plan' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <UtensilsCrossed size={16} strokeWidth={2.5} />
            식단
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              tab === 'plan' ? 'bg-zinc-200 text-zinc-700' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {mealsCompleted}/4
            </span>
          </button>
          <button
            onClick={() => setTab('stock')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-colors ${
              tab === 'stock' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <Package size={16} strokeWidth={2.5} />
            재고
            {reorderItems.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                {reorderItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === 'stock' && (
        <StockView
          reorderItems={reorderItems}
          weekDays={weekDays}
          weekCompleted={weekCompleted}
          streak={streak}
          log={log}
          todayIdx={todayIdx}
          stocks={stocks}
          days={days}
          status={status}
          adjust={adjust}
          refill={refill}
        />
      )}

      {tab === 'plan' && (
        <PlanView mealCheck={mealCheck} toggleMeal={toggleMeal} />
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-8 pb-5 px-5">
        {completedToday ? (
          <button
            onClick={undoToday}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check size={18} strokeWidth={2.5} className="text-emerald-500" />
            오늘 완료 · 되돌리기
          </button>
        ) : (
          <button
            onClick={consumeAll}
            className="w-full bg-white text-black font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check size={18} strokeWidth={2.5} />
            오늘 식단 완료
          </button>
        )}
      </div>
    </div>
  );
}

function StockView({ reorderItems, weekDays, weekCompleted, streak, log, todayIdx, stocks, days, status, adjust, refill }) {
  return (
    <>
      <div className="px-5 pt-5 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">식단 재고</h1>
        <div className="mt-2 flex items-center gap-2">
          {reorderItems.length > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-sm text-zinc-400">발주 필요 <span className="text-red-400 font-medium">{reorderItems.length}개</span></span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-sm text-zinc-400">모든 재고 충분</span>
            </>
          )}
        </div>
      </div>

      <div className="px-5 mb-6">
        <div className="bg-zinc-900/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-zinc-400">
              이번 주 <span className="text-white font-semibold">{weekCompleted}/7</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Flame size={14} className="text-orange-400" strokeWidth={2.5} />
                <span className="text-orange-400 font-semibold">{streak}일 연속</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {['월', '화', '수', '목', '금', '토', '일'].map((label, i) => {
              const d = weekDays[i];
              const done = log.includes(toDateStr(d));
              const isToday = i === todayIdx;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className={`text-[10px] ${isToday ? 'text-white font-semibold' : 'text-zinc-500'}`}>{label}</div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    done ? 'bg-emerald-500' : isToday ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-900'
                  }`}>
                    {done && <Check size={14} strokeWidth={3} className="text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {reorderItems.length > 0 && (
        <div className="px-5 mb-8">
          <div className="text-xs text-red-400 font-semibold tracking-wider uppercase mb-3">발주 필요 — 탭해서 주문</div>
          <div className="space-y-2">
            {reorderItems.map(item => (
              <a
                key={item.id}
                href={item.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => !item.link && e.preventDefault()}
                className="block bg-red-950/40 border border-red-900/50 rounded-2xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-red-300/80 mt-0.5">
                      {formatNum(days(item), '')}일 남음 · {formatNum(stocks[item.id] ?? 0, item.unit)}{item.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500 text-white text-sm font-medium px-3.5 py-2 rounded-xl">
                    <ShoppingCart size={14} strokeWidth={2.5} />
                    주문
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="px-5">
        <div className="text-xs text-zinc-500 font-semibold mb-3 tracking-wider uppercase">전체 재고 — 탭해서 주문</div>
        <div className="space-y-2.5">
          {ITEMS.map(item => {
            const stock = stocks[item.id] ?? item.fullStock;
            const d = days(item);
            const pct = Math.min(100, (stock / item.fullStock) * 100);
            const st = status(item);
            const barColor = st === 'reorder' ? 'bg-red-500' : st === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
            const dayColor = st === 'reorder' ? 'text-red-400' : st === 'warning' ? 'text-amber-400' : 'text-zinc-300';

            const CardHeader = (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-base">{item.name}</span>
                    {item.link && <ExternalLink size={11} className="text-zinc-600" strokeWidth={2.5} />}
                  </div>
                  <div className={`text-sm font-medium ${dayColor}`}>{formatNum(d, '')}일</div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-zinc-500 tabular-nums w-20 text-right">
                    {formatNum(stock, item.unit)}/{formatNum(item.fullStock, item.unit)}{item.unit}
                  </div>
                </div>
              </>
            );

            return (
              <div key={item.id} className="bg-zinc-900/60 rounded-2xl p-4">
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block -m-1 p-1 rounded-lg active:bg-zinc-800/40 transition-colors">
                    {CardHeader}
                  </a>
                ) : CardHeader}

                <div className="flex gap-2">
                  <button onClick={() => adjust(item, -item.dailyUse)} className="flex-1 bg-zinc-800 active:bg-zinc-700 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm">
                    <Minus size={14} strokeWidth={2.5} />
                    <span className="text-zinc-300">먹음</span>
                  </button>
                  <button onClick={() => adjust(item, item.dailyUse)} className="bg-zinc-800 active:bg-zinc-700 rounded-xl py-2.5 px-4 flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} className="text-zinc-400" />
                  </button>
                  <button onClick={() => refill(item)} className="bg-zinc-800 active:bg-zinc-700 rounded-xl py-2.5 px-4 flex items-center justify-center">
                    <RotateCcw size={14} strokeWidth={2.5} className="text-zinc-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-xs text-zinc-600 px-1 leading-relaxed">
          <div className="mb-1">· <span className="text-zinc-500">카드 윗부분 탭</span>: 쿠팡 상품 페이지 열림</div>
          <div className="mb-1">· <span className="text-zinc-500">먹음</span>: 1회 분량 차감 / <span className="text-zinc-500">+</span>: 1회 분량 추가</div>
          <div className="mb-1">· <span className="text-zinc-500">↺</span>: 주문 도착 시 전량 채우기</div>
          <div className="mt-2 text-zinc-700">배송 {LEAD_TIME_DAYS}일 버퍼 적용 — 도착 전 미리 알림</div>
        </div>
      </div>
    </>
  );
}

function PlanView({ mealCheck, toggleMeal }) {
  return (
    <>
      <div className="px-5 pt-5 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">오늘 식단</h1>
        <div className="mt-1 text-sm text-zinc-500">장진영 트레이너 식단</div>
      </div>

      <div className="px-5 mb-6">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mb-3">하루 목표</div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold tracking-tight">{MACROS.kcal.toLocaleString()}</span>
            <span className="text-sm text-zinc-500 ml-1">kcal</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MacroBox label="탄수화물" value={MACROS.carb} color="bg-amber-500/10 border-amber-500/20 text-amber-300" />
            <MacroBox label="단백질" value={MACROS.protein} color="bg-rose-500/10 border-rose-500/20 text-rose-300" />
            <MacroBox label="지방" value={MACROS.fat} color="bg-blue-500/10 border-blue-500/20 text-blue-300" />
          </div>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {MEAL_PLAN.map((meal) => {
          const checked = mealCheck[meal.id];
          return (
            <button
              key={meal.id}
              onClick={() => toggleMeal(meal.id)}
              className={`w-full text-left rounded-2xl p-5 transition-all active:scale-[0.98] ${
                checked ? 'bg-emerald-950/30 border border-emerald-900/50' : 'bg-zinc-900/60 border border-zinc-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    checked ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                  }`}>
                    {checked && <Check size={14} strokeWidth={3} className="text-white" />}
                  </div>
                  <span className={`font-bold tracking-wide ${checked ? 'text-emerald-300' : 'text-white'}`}>
                    {meal.label}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 pl-10">
                {meal.items.map((item, i) => (
                  <div key={i} className={`flex items-baseline justify-between text-sm ${checked ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-300'}`}>
                    <span>{item.name}</span>
                    <span className={`tabular-nums ${checked ? 'text-zinc-600' : 'text-zinc-500'}`}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 mt-6">
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-5">
          <div className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mb-3">언제든 가능</div>
          <div className="space-y-1.5">
            {ANYTIME.map((item, i) => (
              <div key={i} className="flex items-baseline justify-between text-sm">
                <span className="text-zinc-300">{item.name}</span>
                <span className="text-zinc-500 tabular-nums">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 text-xs text-zinc-600 leading-relaxed">
        <div>· 각 끼니 탭하면 완료 체크</div>
        <div>· 자정 지나면 자동으로 초기화</div>
      </div>
    </>
  );
}

function MacroBox({ label, value, color }) {
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="text-[10px] opacity-70 mb-0.5">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}<span className="text-xs font-normal opacity-70 ml-0.5">g</span></div>
    </div>
  );
}
