import type { PhilosophyTradition } from "@/lib/types"

export interface TraditionDefinition {
  id: PhilosophyTradition
  name: string
  nameEn: string
  category: "western" | "eastern" | "modern"
  coreView: string
  representative: string
  keywords: string[]
  axes: {
    resultVsPrinciple: number    // -1 = principle, +1 = result
    individualVsCollective: number // -1 = collective, +1 = individual
    realismVsIdealism: number    // -1 = idealism, +1 = realism
    certaintyVsDoubt: number     // -1 = doubt, +1 = certainty
  }
}

export const TRADITIONS: Record<PhilosophyTradition, TraditionDefinition> = {
  utilitarian: {
    id: "utilitarian",
    name: "공리주의",
    nameEn: "Utilitarianism",
    category: "western",
    coreView: "최대 다수의 최대 행복을 추구하며, 행위의 도덕성은 그 결과가 산출하는 총 효용으로 판단한다.",
    representative: "벤담 / 밀",
    keywords: ["효용", "결과", "행복", "쾌락", "고통", "다수"],
    axes: {
      resultVsPrinciple: 0.9,
      individualVsCollective: -0.5,
      realismVsIdealism: 0.7,
      certaintyVsDoubt: 0.6,
    },
  },

  deontology: {
    id: "deontology",
    name: "의무론",
    nameEn: "Deontology",
    category: "western",
    coreView: "행위의 도덕성은 결과가 아닌 의무와 보편 법칙 준수 여부로 결정된다. 인간은 결코 수단으로만 대우받아서는 안 된다.",
    representative: "칸트",
    keywords: ["의무", "보편법칙", "정언명령", "존엄", "이성", "원칙"],
    axes: {
      resultVsPrinciple: -0.9,
      individualVsCollective: 0.3,
      realismVsIdealism: -0.6,
      certaintyVsDoubt: 0.8,
    },
  },

  existentialism: {
    id: "existentialism",
    name: "실존주의",
    nameEn: "Existentialism",
    category: "western",
    coreView: "실존은 본질에 앞선다. 인간은 스스로 자유롭게 선택하며, 그 선택에 대한 전적인 책임을 진다.",
    representative: "사르트르 / 키에르케고르",
    keywords: ["자유", "선택", "책임", "불안", "실존", "주체성"],
    axes: {
      resultVsPrinciple: 0.1,
      individualVsCollective: 0.9,
      realismVsIdealism: -0.3,
      certaintyVsDoubt: -0.4,
    },
  },

  skepticism: {
    id: "skepticism",
    name: "회의론",
    nameEn: "Skepticism",
    category: "western",
    coreView: "모든 전제와 확실성을 의심한다. 참된 지식에 도달하려면 끊임없이 질문하고 검증해야 한다.",
    representative: "데카르트 / 흄",
    keywords: ["의심", "회의", "검증", "전제", "불확실성", "비판"],
    axes: {
      resultVsPrinciple: 0.0,
      individualVsCollective: 0.4,
      realismVsIdealism: 0.5,
      certaintyVsDoubt: -0.95,
    },
  },

  pragmatism: {
    id: "pragmatism",
    name: "프래그마티즘",
    nameEn: "Pragmatism",
    category: "western",
    coreView: "진리는 실제 경험에서의 유용성으로 검증된다. 이론보다 실천적 결과가 중요하다.",
    representative: "듀이 / 제임스",
    keywords: ["실용", "경험", "결과", "유용성", "실천", "적응"],
    axes: {
      resultVsPrinciple: 0.7,
      individualVsCollective: 0.1,
      realismVsIdealism: 0.9,
      certaintyVsDoubt: -0.2,
    },
  },

  social_contract: {
    id: "social_contract",
    name: "사회계약론",
    nameEn: "Social Contract Theory",
    category: "western",
    coreView: "정의로운 사회는 무지의 베일 뒤에서 합의된 공정한 원칙에 기반한다. 제도가 개인의 자유와 평등을 보장해야 한다.",
    representative: "롤스 / 홉스",
    keywords: ["계약", "정의", "제도", "공정", "합의", "권리"],
    axes: {
      resultVsPrinciple: -0.3,
      individualVsCollective: -0.6,
      realismVsIdealism: -0.4,
      certaintyVsDoubt: 0.5,
    },
  },

  confucianism: {
    id: "confucianism",
    name: "유교",
    nameEn: "Confucianism",
    category: "eastern",
    coreView: "인의예지를 근본으로 삼아 인간관계의 도리를 실천하고, 수신제가치국평천하의 질서를 추구한다.",
    representative: "공자 / 맹자",
    keywords: ["인", "의", "예", "효", "관계", "수양"],
    axes: {
      resultVsPrinciple: -0.5,
      individualVsCollective: -0.8,
      realismVsIdealism: -0.3,
      certaintyVsDoubt: 0.7,
    },
  },

  daoism: {
    id: "daoism",
    name: "도가",
    nameEn: "Daoism",
    category: "eastern",
    coreView: "도(道)는 말로 규정할 수 없으며, 무위자연의 순리를 따르는 것이 최상의 삶이다. 인위적 구분과 집착을 내려놓아라.",
    representative: "장자 / 노자",
    keywords: ["도", "무위", "자연", "순리", "무", "소요유"],
    axes: {
      resultVsPrinciple: 0.2,
      individualVsCollective: 0.3,
      realismVsIdealism: -0.5,
      certaintyVsDoubt: -0.7,
    },
  },

  buddhism: {
    id: "buddhism",
    name: "불교",
    nameEn: "Buddhism",
    category: "eastern",
    coreView: "모든 현상은 공(空)이며 연기(緣起)에 의해 상호 의존적으로 존재한다. 집착을 내려놓는 것이 고통에서 벗어나는 길이다.",
    representative: "나가르주나",
    keywords: ["공", "연기", "무아", "중도", "고", "해탈"],
    axes: {
      resultVsPrinciple: -0.1,
      individualVsCollective: -0.3,
      realismVsIdealism: -0.8,
      certaintyVsDoubt: -0.6,
    },
  },

  legalism: {
    id: "legalism",
    name: "법가",
    nameEn: "Legalism",
    category: "eastern",
    coreView: "인간 본성은 이기적이므로 명확한 법과 상벌 체계로 통치해야 한다. 시스템과 인센티브가 도덕보다 효과적이다.",
    representative: "한비자",
    keywords: ["법", "술", "세", "상벌", "통치", "시스템"],
    axes: {
      resultVsPrinciple: 0.8,
      individualVsCollective: -0.7,
      realismVsIdealism: 0.95,
      certaintyVsDoubt: 0.85,
    },
  },

  critical_theory: {
    id: "critical_theory",
    name: "비판이론",
    nameEn: "Critical Theory",
    category: "modern",
    coreView: "모든 지식과 제도에는 권력관계가 내재해 있다. 보이지 않는 구조적 억압을 폭로하고 해방을 추구한다.",
    representative: "하버마스 / 푸코",
    keywords: ["권력", "구조", "비판", "해방", "담론", "이데올로기"],
    axes: {
      resultVsPrinciple: -0.2,
      individualVsCollective: -0.4,
      realismVsIdealism: 0.3,
      certaintyVsDoubt: -0.5,
    },
  },

  care_ethics: {
    id: "care_ethics",
    name: "돌봄 윤리",
    nameEn: "Ethics of Care",
    category: "modern",
    coreView: "도덕성의 근본은 추상적 원칙이 아니라 구체적 관계 속의 돌봄과 응답이다. 타자의 취약성에 대한 책임이 윤리의 출발점이다.",
    representative: "길리건 / 나딩스",
    keywords: ["돌봄", "관계", "응답", "취약성", "공감", "책임"],
    axes: {
      resultVsPrinciple: 0.3,
      individualVsCollective: -0.5,
      realismVsIdealism: -0.2,
      certaintyVsDoubt: 0.1,
    },
  },
}

export const TRADITION_LIST: TraditionDefinition[] = Object.values(TRADITIONS)
