import Link from "next/link";
import ThemeToggle from "../theme-toggle";

const stats = [
  ["HP", "здоровье карты; при 0 карта выбывает"],
  ["ATK", "базовая сила атаки"],
  ["ARM", "вычитается из входящего урона, но атака всегда наносит минимум 1"],
  ["RNG", "дальность атаки по клеткам"],
  ["SPD", "сколько клеток проходит карта одним движением"],
  ["MED", "сколько HP восстанавливает лечение"],
  ["ENG", "сколько прочности восстанавливает ремонт"],
  ["HULL", "осадный урон пришельца по кораблю"],
];

const defenses = [
  ["CORE", "0", "Корабль полностью открыт"],
  ["OPS", "1", "Лёгкая внутренняя переборка"],
  ["RCTR", "2", "Усиленный реакторный контур"],
  ["HLBR", "3", "Внешняя броня принимает удар"],
];

const enemyRoles = [
  ["Охотник", "Быстрый боец ближнего контакта"],
  ["Броневик", "Живучая цель с высокой бронёй"],
  ["Стрелок", "Атакует экипаж с большой дистанции"],
  ["Разрушитель", "Специалист по осаде корпуса"],
];

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#e7edf5_48%,_#d9e2ef)] px-3 py-4 text-slate-900 sm:px-5 lg:px-7" data-theme-surface>
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Station Desk</span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Rules v0.9</span>
                <ThemeToggle />
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">Defense playbook</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Короткая рабочая инструкция по защите станции. Здесь зафиксированы актуальные правила доски.</p>
            </div>
            <Link className="w-fit shrink-0 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700" href="/">Вернуться к доске</Link>
          </div>
        </header>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">01 · Цель и смена</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Удержать корабль</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Победа наступает, когда уничтожены все пришельцы. Поражение — когда прочность корпуса или число живых членов экипажа падает до нуля.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">1 · ACT</p><p className="mt-2 text-xs leading-5 text-emerald-900">Каждый герой один раз атакует, лечит или ремонтирует.</p></div>
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">2 · MOVE</p><p className="mt-2 text-xs leading-5 text-cyan-900">Каждый герой один раз двигается. ACT и MOVE можно делать в любом порядке.</p></div>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">3 · SHIFT</p><p className="mt-2 text-xs leading-5 text-rose-900">После End shift все пришельцы двигаются и действуют по инициативе.</p></div>
            </div>
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">Activity Feed хранит события текущей партии, показывает новые записи сверху и разделяет их по сменам. Смерть героя выделяется как критическое событие. New board полностью очищает журнал.</p>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_16px_50px_rgba(15,23,42,0.15)] sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">02 · Маршрут</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Тыл только через передовую</h2>
            <div className="mt-5 overflow-x-auto pb-2">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Core</span><span>Ops</span><span>Reactor</span><span>Breach</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {["●", "●", "●", "●"].map((item, index) => <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-3 text-center text-cyan-300" key={`front-${index}`}>{item} Передовая</div>)}
                </div>
                <div className="grid grid-cols-4 gap-2 px-8 text-center text-slate-500"><span>↕</span><span>↕</span><span>↕</span><span>↕</span></div>
                <div className="grid grid-cols-4 gap-2">
                  {["●", "●", "●", "●"].map((item, index) => <div className="rounded-xl border border-slate-700 bg-slate-900 py-3 text-center text-slate-300" key={`rear-${index}`}>{item} Тыл</div>)}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">Передовые соседних отсеков соединены между собой. Тыл соединён только со своей передовой. Если хватает SPD, промежуточную передовую можно пройти транзитом.</p>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">03 · Действия</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Атака, лечение, ремонт</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p><strong className="text-slate-900">Атака:</strong> цель должна быть в пределах RNG. Урон равен ATK − ARM, минимум 1.</p>
              <p><strong className="text-slate-900">Лечение:</strong> нужен MED выше 0. Целевой герой должен быть ранен и стоять не дальше одной клетки.</p>
              <p><strong className="text-slate-900">Ремонт:</strong> нужен ENG выше 0. В Reactor и Hull Breach применяется полный ENG, в остальных отсеках — половина с округлением вверх.</p>
              <p><strong className="text-slate-900">Вместимость:</strong> в одной клетке может находиться не более двух членов экипажа и не более двух пришельцев.</p>
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">04 · Защита корпуса</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Броня зависит от отсека</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Когда пришелец атакует корабль, защита текущего отсека вычитается из его HULL. Урон может быть полностью поглощён.</p>
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50">
              {defenses.map(([zone, defense, note]) => <div className="grid grid-cols-[70px_54px_1fr] items-center gap-3 px-3 py-2.5 text-xs" key={zone}><span className="font-bold text-slate-700">{zone}</span><span className="rounded-md bg-white px-2 py-1 text-center font-bold text-blue-700">DEF {defense}</span><span className="text-slate-500">{note}</span></div>)}
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">05 · Показатели карты</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Что означают сокращения</h2>
            <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {stats.map(([stat, description]) => <div className="grid grid-cols-[58px_1fr] gap-3 px-3 py-2 text-xs leading-5" key={stat}><span className="font-bold text-slate-800">{stat}</span><span className="text-slate-500">{description}</span></div>)}
            </div>
          </section>

          <section className="rounded-[26px] border border-rose-200 bg-rose-50/90 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600">06 · Противник</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-rose-950">Пришельцы принимают решения</h2>
            <p className="mt-3 text-sm leading-6 text-rose-900/75">В свой ход каждый пришелец анализирует все позиции в пределах SPD. Он может переместиться и атаковать, добивает раненых, охотится на медиков и инженеров и сравнивает ценность атаки героя с уроном по корпусу. Разрушители чаще выбирают корабль.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {enemyRoles.map(([role, description]) => <div className="rounded-xl border border-rose-200 bg-rose-100 p-3 text-rose-900" key={role}><p className="text-[10px] font-bold uppercase tracking-[0.14em]">{role}</p><p className="mt-1 text-xs leading-5 opacity-80">{description}</p></div>)}
            </div>
            <div className="mt-4 rounded-2xl border border-rose-200 bg-white/60 p-3 text-xs leading-5 text-rose-900/70">Состав, имена, характеристики и стартовые позиции обеих сторон генерируются заново кнопкой New board. В экипаже всегда остаются как минимум медик, инженер и стрелок.</div>
          </section>
        </div>
      </div>
    </main>
  );
}
