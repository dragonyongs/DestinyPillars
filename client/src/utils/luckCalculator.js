import { periods, yearDescriptions } from '../constants/mappings';

/**
 * 대운 시작 나이 계산 함수
 */
export const calculateBigLuckStartAge = (birthMonth, gender) => birthMonth + (gender === "male" ? 5 : -5);

/**
 * 대운 기간 설명 반환 함수
 */
export const getBigLuckPeriodDescription = (startAge, periodIndex) => {
    const periodStartAge = startAge + periodIndex * 10;
    const { element = "알 수 없음", description = "기운 설명 없음" } = periods[periodIndex] || {};
    return `${periodStartAge}세 ~ ${periodStartAge + 10}세: ${description}`;
};

/**
 * 대운 기간 계산 함수
 */
export const getBigLuckPeriods = (startAge) => 
    Array.from({ length: 8 }, (_, i) => getBigLuckPeriodDescription(startAge, i)).join("<br />");

/**
 * 연간 운세 설명 반환 함수
 */
export const getYearlyLuckPeriodDescription = (year) => {
    const elements = ["목", "화", "토", "금", "수"];
    const element = elements[year % 5];
    return `${year}년: ${yearDescriptions[element] || "알 수 없는 해."}`;
};

/**
 * 연간 운세 기간 계산 함수
 */
export const getYearlyLuckPeriods = (startYear) => 
Array.from({ length: 10 }, (_, i) => getYearlyLuckPeriodDescription(startYear + i)).join("<br />");
