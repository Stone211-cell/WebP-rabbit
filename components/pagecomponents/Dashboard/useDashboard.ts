// useDashboard.ts
// import dayjs from 'dayjs';
// import buddhistEra from 'dayjs/plugin/buddhistEra';
// dayjs.extend(buddhistEra);

// export function useDashboard() {
//   const [period, setPeriod] = useState<'today'|'week'|'month'|'quarter'|'year'>('week');
//   const [baseDate, setBaseDate] = useState(dayjs());

//   const weekLabel = `${baseDate.startOf('week').format('D MMM BBBB')} – ${baseDate.endOf('week').format('D MMM BBBB')}`;

//   function shiftWeek(dir: number) {
//     setBaseDate(d => d.add(dir, 'week'));
//   }

//   return {
//     period,
//     weekLabel,
//     setTimePeriod: setPeriod,
//     shiftWeek,
//   };
// }