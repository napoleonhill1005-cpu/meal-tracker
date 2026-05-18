import React, { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, RotateCcw, Check, Flame, ExternalLink, Package, UtensilsCrossed } from 'lucide-react';

const LEAD_TIME_DAYS = 2;

const ITEMS = [
  { id: 'hetbap', name: '햇반', unit: '개', fullStock: 36, dailyUse: 2, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuyrS2P3A' },
  { id: 'chicken', name: '닭가슴살', unit: '팩', fullStock: 24, dailyUse: 2, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuAv6vEpo' },
  { id: 'beef', name: '우둔살', unit: '팩', fullStock: 20, dailyUse: 1, baseThreshold: 5, link: 'https://link.coupang.com/a/dGuDttnF5o' },
  { id: 'yogurt', name: '그릭요거트', unit: 'g', fullStock: 1000, dailyUse: 100, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuEtLjxca' },
  { id: 'banana', name: '바나나', unit: 'g', fullStock: 1000, dailyUse: 200, baseThreshold: 3, link: 'https://link.coupang.com/a/dGuFEDhz52' },
  { id: 'bread', name: '식빵', unit: 'g', fullStock: 660, dailyUse: 160, baseThreshold: 2, link: 'https://link.coupang.com/a/dGuGCkCpA4' },
  { id: 'veggies', name: '냉동 야채', unit: 'g', fullStock: 3000, dailyUse: 100, baseThreshold: 5, link: 'https://link.coupang.com/a/dGuUGTcIMe' },
  { id: 'pb', name: '땅콩버터', unit: 'g', fullStock: 450, dailyUse: 40, baseThreshold: 5, link: 'https://link.coupang.com/a/dGuCcMHoSi' },
  { id: 'almond', name: '아몬드', unit: 'g', fullStock: 1000, dailyUse: 10, baseThreshold: 10, link: 'https://link.coupang.com/a/dGuWWEnuvI' },
  { id: 'protein', name: '프로틴 (매스게이너)', unit: 'g', fullStock: 5000, dailyUse: 30, baseThreshold: 14, link: 'https://www.myprotein.co.kr/p/sports-nutrition/impact-whey-mass-gainer/10529988/?variation=11372978' }
].map(i => ({ ...i, thresholdDays: i.baseThreshold + LEAD_TIME_DAYS }));

const MEAL_PLAN = [
  {
    id: 'postworkout',
    label: '운동 후',
    items: [
      { name: '오넛티 땅콩버터', amount: '20g', itemId: 'pb', deduct: 20 },
      { name: '식빵', amount: '2조각', itemId: 'bread', deduct: 80 },
      { name: '랩노쉬 쉐이크', amount: '1잔', itemId: 'protein', deduct: 30 }
    ]
  },
  {
    id: 'meal1',
    label: 'MEAL 1',
    items: [
      { name: '햇반', amount: '250g', itemId: 'hetbap', deduct: 1 },
      { name: '닭가슴살', amount: '200g', itemId: 'chicken', deduct: 2 }
    ]
  },
  {
    id: 'meal2',
    label: 'MEAL 2',
    items: [
      { name: '햇반', amount: '230g', itemId: 'hetbap', deduct: 1 },
      { name: '우둔살', amount: '150g', itemId: 'beef', deduct: 1 },
      { name: '올리브오일', amount: '10g' }
    ]
  },
  {
    id: 'meal3',
    label: 'MEAL 3',
    items: [
      { name: '식빵', amount: '2조각', itemId: 'bread', deduct: 80 },
      { name: '오넛티 땅콩버터', amount: '20g', itemId: 'pb', deduct: 20 }
    ]
  },
  {
    id: 'meal4',
    label: 'MEAL 4',
    items: [
      { name: '그릭요거트', amount: '100g', itemId: 'yogurt', deduct: 100 },
      { name: '바나나', amount: '200g', itemId: 'banana', deduct: 200 }
    ]
  }
];

const ANYTIME = [
  { name: '야채 하루', amount: '100g' },
  { name: '김치, 김', amount: '섭취 가능' }
];

const MACROS = { carb: 300, protein: 155, fat: 56, kcal: 2400 };

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

const DAY_RESET_HOUR = 7; // 오전 7시에 새 날 시작

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// 식단 기준일: 새벽 7시 이전은 전날로 취급
function getMealDate() {
  const now = new Date();
  if (now.getHours() < DAY_RESET_HOUR) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  return now;
}

function getMealDateStr() {
  return toDateStr(getMealDate());
}

function getStreak(log) {
  if (!log || log.length === 0) return 0;
  const today = getMealDate();
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
  const now = getMealDate();
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
    return storage.get(`meal-check-${getMealDateStr()}`) || {};
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
    storage.set(`meal-check-${getMealDateStr()}`, newCheck);
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
    // 아직 체크 안 된 끼니의 품목만 추가 차감
    const newStocks = { ...stocks };
    const newCheck = { ...mealCheck };
    MEAL_PLAN.forEach(meal => {
      if (newCheck[meal.id]) return; // 이미 체크된 끼니는 건너뜀
      newCheck[meal.id] = true;
      meal.items.forEach(item => {
        if (!item.itemId) return;
        const current = newStocks[item.itemId] ?? 0;
        newStocks[item.itemId] = Math.max(0, current - item.deduct);
      });
    });
    saveStocks(newStocks);
    saveMealCheck(newCheck);

    const today = getMealDateStr();
    if (!log.includes(today)) saveLog([...log, today].sort());
  }

  function undoToday() {
    const today = getMealDateStr();
    saveLog(log.filter(d => d !== today));

    // 체크된 끼니의 품목만 복구
    const newStocks = { ...stocks };
    MEAL_PLAN.forEach(meal => {
      if (!mealCheck[meal.id]) return;
      meal.items.forEach(item => {
        if (!item.itemId) return;
        const current = newStocks[item.itemId] ?? 0;
        const def = ITEMS.find(i => i.id === item.itemId);
        const max = def ? def.fullStock : current + item.deduct;
        newStocks[item.itemId] = Math.min(max, current + item.deduct);
      });
    });
    saveStocks(newStocks);
    saveMealCheck({});
  }

  // 새벽 7시 지나면 자동으로 새 날 식단 체크 로드
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDateStr = getMealDateStr();
      const stored = storage.get(`meal-check-${currentDateStr}`) || {};
      setMealCheck(prev => {
        // 다른 날의 체크가 있으면 새 날로 교체
        const prevKeys = Object.keys(prev).join(',');
        const newKeys = Object.keys(stored).join(',');
        if (prevKeys !== newKeys) return stored;
        return prev;
      });
    }, 60000); // 1분마다
    return () => clearInterval(interval);
  }, []);

  function toggleMeal(mealId) {
    const meal = MEAL_PLAN.find(m => m.id === mealId);
    if (!meal) return;
    const wasChecked = !!mealCheck[mealId];
    const willBeChecked = !wasChecked;

    // 식단 체크 토글
    saveMealCheck({ ...mealCheck, [mealId]: willBeChecked });

    // 재고 자동 차감/복구
    const newStocks = { ...stocks };
    meal.items.forEach(item => {
      if (!item.itemId) return;
      const current = newStocks[item.itemId] ?? 0;
      if (willBeChecked) {
        // 체크 → 차감
        newStocks[item.itemId] = Math.max(0, current - item.deduct);
      } else {
        // 체크 해제 → 복구
        const def = ITEMS.find(i => i.id === item.itemId);
        const max = def ? def.fullStock : current + item.deduct;
        newStocks[item.itemId] = Math.min(max, current + item.deduct);
      }
    });
    saveStocks(newStocks);
  }

  const reorderItems = ITEMS.filter(i => status(i) === 'reorder');
  const today = getMealDateStr();
  const completedToday = log.includes(today);
  const streak = getStreak(log);
  const weekDays = getWeekDays();
  const weekCompleted = weekDays.filter(d => log.includes(toDateStr(d))).length;
  const todayIdx = (() => {
    const day = getMealDate().getDay();
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
              {mealsCompleted}/{MEAL_PLAN.length}
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
        <div>· 끼니 탭하면 재고에서 자동 차감</div>
        <div>· 체크 해제하면 재고 복구</div>
        <div>· 매일 오전 7시에 자동으로 초기화</div>
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
