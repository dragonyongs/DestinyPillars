import { useEffect, useState } from "react";
import { Solar } from 'lunar-javascript';
import { heavenMapping } from '../constants/mappings';

import { 
  calculateYearPillar, 
  calculateMonthPillar, 
  calculateDayPillar, 
  calculateTimePillar,
  getElementDescription,
  getStemAttributes,
  calculateSaju,
  // getPillarDescription,
} from "../utils/pillarCalculator"

import {
  calculateTenGod,
  calculateYukChinFromPillarsDetailed,
  getHiddenStemsDescription,
  getTenGodDescription,
  getBranchRelationDetailed,
} from "../utils/relationships"

import {
  analyzeElementBalance,
  calculateElementCounts,
  determineStrength,
  getElementBalanceInterpretation,
  recommendJobsBasedOnBalance,
} from "../utils/elementAnalysis"

import {
  getBigLuckPeriods,
  getYearlyLuckPeriods,
  calculateBigLuckStartAge,
} from "../utils/luckCalculator.js"

import { calculateCareerLuck } from "../utils/careerLuck";

import {
  recommendYongshin,
} from "../utils/yongshinRecommendation.js";

export default function ResultViewer({ time, yearStemIndex, birth, gender }) {
  const [result, setResult] = useState(null);
  const [lunarDateStr, setLunarDateStr] = useState("");
  const [year, month, day] = birth.split("-").map(Number); 
  const [hour, minute] = time.split(":").map(Number); 

  useEffect(() => {
    if (!year || !month || !day || !time || !gender || yearStemIndex === null) {
      return;
    }

    try {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      const lunarStr = `${lunar.getYear()}년 ${lunar.isLeapYear ? "윤" : ""}${lunar.getMonth()}월 ${lunar.getDay()}일 ${hour}시 ${minute}분`;
      setLunarDateStr(lunarStr);

      const yearPillar = calculateYearPillar(year);
      const monthPillar = calculateMonthPillar(year, month, day);
      const dayPillar = calculateDayPillar(year, month, day);
      
      // 객체형 매핑을 반영하여 인덱스 구하기
      const dayStem = dayPillar.stem.value;
      const dayStemIndex = Object.values(heavenMapping).indexOf(dayStem);
      const timePillar = calculateTimePillar(dayStemIndex, Number(hour), Number(minute));

      // 새로운 상세 해석 가져오기
      const yearDetails = yearPillar.interpretation;
      const monthDetails = monthPillar.interpretation;
      const dayDetails = dayPillar.interpretation;
      const timeDetails = timePillar.interpretation;

      const comprehensiveInterpretation = calculateSaju(year, month, day, minute);

      const saju = [
        yearPillar.branch.value,
        monthPillar.branch.value,
        dayPillar.branch.value,
        timePillar.branch.value
      ];

      const pillars = {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        time: timePillar
      };

      const hiddenStemsDescription = getHiddenStemsDescription(yearPillar.branch.value);
      const tenGod = calculateTenGod(dayStem, monthPillar.stem.value);
      const tenGodExplanation = getTenGodDescription(tenGod);
      const startAge = calculateBigLuckStartAge(month, gender);
      const bigLuck = getBigLuckPeriods(startAge);
      const yearlyLuck = getYearlyLuckPeriods(2025);

      // 통합된 오행 개수 계산
      const elementCounts = calculateElementCounts(saju, pillars);
      const strength = determineStrength(elementCounts);
      const balance = analyzeElementBalance(elementCounts);
      const yongshin = recommendYongshin(elementCounts);
      const jobs = recommendJobsBasedOnBalance(elementCounts);
      const stemAttrs = getStemAttributes(yearPillar.stem.value);
      const elementDesc = getElementDescription(stemAttrs.element);

      const interpretation = getElementBalanceInterpretation(elementCounts);
      const { relation, description } = getBranchRelationDetailed(yearPillar.branch.value, monthPillar.branch.value);

      const yukChin = calculateYukChinFromPillarsDetailed(pillars);
      const careerLuckResult = calculateCareerLuck(pillars, { birthYear: year, yearRangeStart: "2025", yearRangeEnd: "2028" });
      const formattedCareerLuck = formatCareerLuck(careerLuckResult);

      function formatCareerLuck(careerLuck) {
        if (!careerLuck || !careerLuck.success) {
          return "직장운 해석 데이터를 불러올 수 없습니다.";
        }
      
        const { basicInfo, basicAnalysis, yearlyAnalysis } = careerLuck;
        const { dayStem, dayElement } = basicInfo;
        const {
          personality,
          elementalHarmony,
          careerAdvice,
          detailedAdvice: { strengths, weaknesses, recommendedFields, developmentAreas },
        } = basicAnalysis;
      
        const formattedStrengths = strengths.join(", ");
        const formattedWeaknesses = weaknesses.join(", ");
        const formattedRecommendedFields = recommendedFields.join(", ");
        const formattedDevelopmentAreas = developmentAreas.join(", ");
      
        const yearlyAnalysisStr = Object.entries(yearlyAnalysis)
          .map(([year, { stem, age, analysis }]) => {
            const generalLuck = analysis.generalLuck;
            const ageSpecificAdvice = analysis.ageSpecificAdvice;
            const dayRelationship = analysis.dayRelationship;
            const transitionAdvice = analysis.transitionAdvice || '전년도 데이터 없음';
            const detailedAdvice = analysis.detailedAdvice;
            const careerFocus = analysis.careerFocus;
        
            return `
              ${year}년 (${stem}, ${age}세)<br />
              - 일반 운세: ${generalLuck}<br />
              - 연령별 조언: ${ageSpecificAdvice}<br />
              - 일간 관계: ${dayRelationship}<br />
              - 전환 조언: ${transitionAdvice}<br />
              • 상세 조언<br />
                - 집중해야 할 핵심 역량: ${detailedAdvice.keySkillsToFocus.join(', ')}<br />
                - 잠재적 도전 과제: ${detailedAdvice.potentialChallenges.join(', ')}<br />
                - 개발 영역: ${detailedAdvice.developmentAreas.join(', ')}<br />
                - 경력 기회: ${detailedAdvice.careerOpportunities.join(', ')}<br />
              • 경력 집중<br />
                - 단기 목표: ${careerFocus.shortTermGoals.join(', ')}<br />
                - 장기 목표: ${careerFocus.longTermGoals.join(', ')}<br />
                - 주요 프로젝트: ${careerFocus.keyProjects.join(', ')}<br />
                - 네트워킹 집중: ${careerFocus.networkingFocus.join(', ')}
            `;
          }).join("<br /><br />");

        return `
          기본 정보:<br />
          - 일간: ${dayStem} (${dayElement})<br /><br />
          성격 분석:<br />
          - ${personality}<br /><br />
          오행 조화:<br />
          - ${elementalHarmony}<br /><br />
          직업 조언:<br />
          - ${careerAdvice}<br /><br />
          상세 조언:<br />
          - 강점: ${formattedStrengths}<br />
          - 약점: ${formattedWeaknesses}<br />
          - 추천 분야: ${formattedRecommendedFields}<br />
          - 개발 영역: ${formattedDevelopmentAreas}<br />
          연도별 분석:<br />
          ${yearlyAnalysisStr}
        `;
      }

      
      // 육친 관계를 그룹화하여 중복 제거
      const groupedRelations = yukChin.relations.reduce((acc, relation) => {
        if (!acc[relation.value]) {
          acc[relation.value] = [];
        }
        acc[relation.value].push(relation.type);
        return acc;
      }, {});
      
      // 출력 문자열 생성
      const yukChinOutput = `
        본인: ${yukChin.self.value} (${yukChin.self.interpretation})<br />
        ${Object.entries(groupedRelations)
          .map(([relationValue, types]) => {
            const relationDetails = [
              ...new Set(
                yukChin.relations
                  .filter(rel => rel.value === relationValue)
                  .map(rel => rel.interpretation)
              )
            ];
            return `
              ${types.join(', ')}: ${relationValue}<br />
              ${relationDetails.join('<br />')}
            `;
          })
          .join('')}
        <br />
        *육친 빈도 분석:<br />
        ${Object.entries(yukChin.analysis.frequency)
          .map(([god, count]) => `${god}: ${count} 개`)
          .join(', ')}<br />
        <br />
        *과다 및 부족 해석:<br />
        ${
          yukChin.analysis.excessDeficiencyInterpretations.length > 0
            ? yukChin.analysis.excessDeficiencyInterpretations.join('<br />')
            : '특이사항 없음.'
        }<br />
        <br />
        *지지 간의 합충 관계:<br />
        ${yukChin.analysis.branchRelations.length > 0
          ? yukChin.analysis.branchRelations.join('<br />')
          : '특이사항 없음.'}
      `;

      setResult({
        "연주": `${yearPillar.stem.key}${yearPillar.branch.key}(${yearPillar.stem.value}${yearPillar.branch.value}) - 
          (${yearDetails.pillarContext.significance} )<br />
          성격: ${yearDetails.personality.stemPersonality}<br />
          강점: ${yearDetails.characteristics.strengths}<br />
          약점: ${yearDetails.characteristics.weaknesses}
        `,
        "월주": `${monthPillar.stem.key}${monthPillar.branch.key}(${monthPillar.stem.value}${monthPillar.branch.value}) - 
          (${monthDetails.pillarContext.significance})<br />
          성격: ${monthDetails.personality.stemPersonality}<br />
          강점: ${monthDetails.characteristics.strengths}<br />
          약점: ${monthDetails.characteristics.weaknesses}
        `,
        "일주": `${dayPillar.stem.key}${dayPillar.branch.key}(${dayPillar.stem.value}${dayPillar.branch.value}) - 
          (${dayDetails.pillarContext.significance})<br />
          성격: ${dayDetails.personality.stemPersonality}<br />
          강점: ${dayDetails.characteristics.strengths}<br />
          약점: ${dayDetails.characteristics.weaknesses}
        `,
        "시주": `${timePillar.stem.key}${timePillar.branch.key}(${timePillar.stem.value}${timePillar.branch.value}) - 
          (${timeDetails.pillarContext.significance})<br />
          성격: ${timeDetails.personality.stemPersonality}<br />
          강점: ${timeDetails.characteristics.strengths}<br />
          약점: ${timeDetails.characteristics.weaknesses}
        `,
        "종합 해석": `
          성격 개요:<br />
          ${comprehensiveInterpretation.overall.personalityOverview}<br />
          인생 방향:<br />
          ${comprehensiveInterpretation.overall.lifeDirection}<br />
          추천사항:<br />
          ${comprehensiveInterpretation.overall.recommendations}
        `,

        "오행 설명": elementDesc,
        // "연주": `${yearPillar.stem.key}${yearPillar.branch.key}(${yearPillar.stem.value}${yearPillar.branch.value}) (${stemAttrs.yinYang}, ${stemAttrs.element}) - ${getPillarDescription('연주', yearPillar).replace(/\n/g, '<br>')}`,
        // "월주": `${monthPillar.stem.key}${monthPillar.branch.key}(${monthPillar.stem.value}${monthPillar.branch.value}) - ${getPillarDescription('월주', monthPillar)})`,
        // "일주": `${dayPillar.stem.key}${dayPillar.branch.key}(${dayPillar.stem.value}${dayPillar.branch.value}) - ${getPillarDescription('일주', dayPillar)})`,
        // "시주": `${timePillar.stem.key}${timePillar.branch.key}(${timePillar.stem.value}${timePillar.branch.value}) - ${getPillarDescription('시주', timePillar)})`,
        "지장간": hiddenStemsDescription,
        "십신": `${tenGod} - ${dayStem} ${monthPillar.stem.value} (${tenGod}): ${tenGodExplanation}`,
        "대운": bigLuck,
        "세운": yearlyLuck,
        "오행균형": `${balance}<br />${interpretation}`,
        "연-월 관계": `${relation} - ${description}`,
        "용신": yongshin.interpretation,
        "신강신약": strength.description,
        "직업추천": jobs,
        "육친(六親)": yukChinOutput,
        "직장운 해석": formattedCareerLuck,
      });
    } catch (error) {
      console.error('Error calculating result:', error);
      setResult(null);
    }
  }, [year, month, day, time, yearStemIndex, birth, gender]);

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
        <p className="text-center text-slate-600 text-lg mt-2">{`${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`}</p>
        {year && month && day && <p className="text-center text-slate-600 text-lg mt-2">{`음력: ${lunarDateStr}`}</p>}
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['연주', '월주', '일주', '시주'].map((pillar) => {
          const content = result[pillar]?.split('-'); // '-' 기준으로 값 분리
          const mainInfo = content[0]?.trim(); // 예: 을(乙)축(丑) (음, 목) 부분
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
  
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
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
              {paragraphs}
            </div>
          );
        })}
      </div>
    </div>
  );
}