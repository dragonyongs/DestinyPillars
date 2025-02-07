import { useEffect, useState } from "react";
import {
  calculateYearPillar,
  calculateMonthPillar,
  calculateDayPillar,
  calculateTimePillar,
  calculateTenGod,
  getBigLuckPeriods,
  getTenGodDescription,
  getYearlyLuckPeriods,
  getBranchRelation,
  recommendYongshin,
  determineStrength,
  analyzeElementBalance,
  // recommendJobs,
  getStemAttributes,
  getElementDescription,
  heavenlyStems,
  calculateBigLuckStartAge,
  calculateElementCounts,
  getPillarDescription,
  getHiddenStemsDescription,
  recommendJobsBasedOnBalance,
} from "../utils/saJuCalculator";

export default function ResultViewer({ year, month, day, time, yearStemIndex, trigger }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!year || !month || !day || !time || yearStemIndex === null) {
      return;
    }

    try {
      const yearPillar = calculateYearPillar(Number(year));
      const monthPillar = calculateMonthPillar(Number(year), Number(month), Number(day));
      const dayPillar = calculateDayPillar(Number(year), Number(month), Number(day));
      const dayStem = dayPillar.stem;
      const dayStemIndex = heavenlyStems.indexOf(dayStem);
      const timePillar = calculateTimePillar(dayStemIndex, Number(time));

      const saju = [
        yearPillar.branch,
        monthPillar.branch,
        dayPillar.branch,
        timePillar.branch
      ];

      const pillars = [yearPillar, monthPillar, dayPillar, timePillar];
      // const hidden = getHiddenStems(yearPillar.branch);
      const hiddenStemsDescription = getHiddenStemsDescription(yearPillar.branch);
      const tenGod = calculateTenGod(dayStem, monthPillar.stem);
      const tenGodExplanation = getTenGodDescription(tenGod);
      const bigLuck = getBigLuckPeriods(calculateBigLuckStartAge(Number(month), "남"));
      const yearlyLuck = getYearlyLuckPeriods(2025);

      // 통합된 오행 개수 계산
      const elementCounts = calculateElementCounts(saju, pillars);
      const strength = determineStrength(elementCounts);
      const balance = analyzeElementBalance(elementCounts);
      const yongshin = recommendYongshin(elementCounts);
      // const jobs = recommendJobs(yongshin.yongshin);
      const jobs = recommendJobsBasedOnBalance(balance);
      const stemAttrs = getStemAttributes(yearPillar.stem);
      const elementDesc = getElementDescription(stemAttrs.element);

      const yearMonthRelation = getBranchRelation(yearPillar.branch, monthPillar.branch) || "없음";
      const monthDayRelation = getBranchRelation(monthPillar.branch, dayPillar.branch) || "없음";
      const dayTimeRelation = getBranchRelation(dayPillar.branch, timePillar.branch) || "없음";

      setResult({
        "연주": `${yearPillar.stem}${yearPillar.branch} (${stemAttrs.yinYang}, ${stemAttrs.element}) - ${getPillarDescription('연주', yearPillar).replace(/\n/g, '<br>')}`,
        "오행 설명": elementDesc,
        "월주": `${monthPillar.stem}${monthPillar.branch} - ${getPillarDescription('월주', monthPillar)})`,
        "일주": `${dayPillar.stem}${dayPillar.branch} - ${getPillarDescription('일주', dayPillar)})`,
        "시주": `${timePillar.stem}${timePillar.branch} - ${getPillarDescription('시주', timePillar)})`,
        "지장간": hiddenStemsDescription,
        "십신": `${tenGod} - ${dayStem} ${monthPillar.stem} (${tenGod}): ${tenGodExplanation}`,
        "대운": bigLuck,
        "세운": yearlyLuck,
        "연-월 관계": yearMonthRelation,
        "월-일 관계": monthDayRelation,
        "일-시 관계": dayTimeRelation,
        "용신": yongshin.interpretation,
        "신강신약": strength.description,
        "오행균형": balance,
        "직업추천": jobs,
      });
    } catch (error) {
      console.error('Error calculating result:', error);
      setResult(null);
    }
  }, [year, month, day, time, yearStemIndex, trigger]);

  if (!result) {
    return (
      <div className="max-w-7xl mx-auto p-6 min-h-screen flex items-center justify-center">
        <p className="text-center text-lg text-red-400">계산 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="shadow-lg bg-white/90 backdrop-blur p-6 rounded-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-slate-800 text-center">사주 분석</h1>
        <p className="text-center text-slate-600 text-lg mt-2">{`${year}년 ${month}월 ${day}일 ${time}시`}</p>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['연주', '월주', '일주', '시주'].map((pillar) => {
          const content = result[pillar]?.split('-'); // '-' 기준으로 값 분리
          const mainInfo = content[0]?.trim(); // 을(乙)축(丑) (음, 목) 부분
          const description = content[1]?.trim(); // 설명 부분

          return (
            <div
              key={pillar}
              className="p-6 bg-white/90 rounded-xl shadow-md text-center border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-slate-700">{pillar}</h3>
              {mainInfo && (
                <p className="text-base font-semibold text-slate-800 mt-2">{mainInfo}</p>
              )}
              {description && (
                <p
                  className="text-left text-sm text-slate-600 mt-2"
                  dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
                />
              )}
            </div>
          );
        })}
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(result).map(([key, value]) => {
          if (['연주', '월주', '일주', '시주'].includes(key)) return null;
          
          const paragraphs = typeof value === 'string' && value.includes('<br />')
          ? value.split('<br />').map((item, index) => (
              <p key={index} className="text-slate-600 mt-2">{item.trim()}</p>
            ))
          : <p className="text-slate-600 mt-2">{value}</p>;

          return (
            <div key={key} className="p-6 bg-white/90 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-slate-700">{key}</h3>
              {/* 위험하게 HTML 삽입 */}
              {paragraphs}
              {/* <p className="text-slate-600 mt-2" dangerouslySetInnerHTML={{ __html: value }} /> */}
            </div>
          );
        })}
      </div>
    </div>
  );
  
}