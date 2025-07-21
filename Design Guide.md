## 색상 체계 (Color System)

### 1) 적용 원칙

- **Spot Color(별색) 우선**
    - 신문·잡지·패키지 등 인쇄 매체는 별색 사용이 원칙이며, 여건상 4색 프로세스(CMYK)로 대체 가능
    - 인쇄 환경(잉크 농도·제도 등)에 따른 편차를 최소화하기 위해 교정쇄로 반드시 색상 비교
- **RGB 모드**
    - 디지털 매체는 매체별 색상 차이를 고려하여 아래 색상 값을 기준으로 디바이스별 보정 후 적용
- **Main vs Sub**
    - **OK Orange**를 중심축(Main)으로 사용
    - 서브 컬러는 보조적·강조 요소로만 사용

### 2) 공식 팔레트

| 역할 | 컬러명 | Pantone | CMYK | RGB | HEX |
| --- | --- | --- | --- | --- | --- |
| **Main** | **OK Orange** | 2026 C | C0 M87 Y100 K0 | 245 80 0 | `#F55000` |
| Sub | OK Dark Brown | 411 C | C30 M40 Y30 K65 | 85 71 74 | `#55474A` |
| Sub/Accent | OK Yellow | 130 C | C0 M40 Y100 K0 | 255 170 0 | `#FFA400` |
| Sub/Neutral | OK Bright Gray | Warm Gray 2 C | C5 M5 Y8 K5 | 227 223 218 | `#E3DFDA` |
| Special | OK Gold (금박/무광) | 875 C | — | — | — |

> Note : Metallic Gold는 별색(후가공) 전용으로만 사용하며, CMYK/RGB 변환을 금지합니다.
> 

---

## 2.2 색상 적용 비율 규정 (Color Application Rate)

### 1) 메인·서브 컬러 조합(Full Color 1 ~ 5)

| Scheme | OK Orange | OK Dark Brown | OK Yellow | OK Bright Gray | White·Negative |
| --- | --- | --- | --- | --- | --- |
| **Full Color 1** | **≈ 55 %** | ≈ 20 % | ≈ 15 % | ≈ 10 % | 0 % |
| **Full Color 2** | **≈ 70 %** | ≈ 20 % | — | ≈ 10 % | 0 % |
| **Full Color 3** | **≈ 25 %** | ≈ 12.5 % | ≈ 12.5 % | — | **≈ 50 %** |
| **Full Color 4** | **≈ 30 %** | ≈ 20 % | — | — | **≈ 50 %** |
| **Full Color 5** | **≈ 75 %** | ≈ 25 % | — | — | 0 % |

> Full Color 1 – 2 : 인쇄물·온라인 배너 등 컬러 풀 사용Full Color 3 – 4 : 여백(White Space)을 적극 활용하는 고급 레이아웃Full Color 5 : 단색계 디자인(Orange + Brown) 필요 시 사용
> 

### 2) Tone on Tone Tint 규정

> 명도 차이를 최소 20 % 이상 확보해야 색상 구분이 뚜렷해집니다.
> 

| 컬러 · Tone 단계 | 0 % | 20 % | 40 % | 60 % | 80 % | 100 % |
| --- | --- | --- | --- | --- | --- | --- |
| **OK Orange_5-tone** | — | ● | ● | ● | ● | ● |
| **OK Orange_4-tone** | ○ | — | 35 % | 65 % | — | ● |
| **OK Orange_3-tone** | ○ | — | — | 50 % | — | ● |
| **OK Orange_2-tone** | — | — | — | 50 % | — | ● |
| **OK Dark Brown_5-tone** | — | ● | ● | ● | ● | ● |
| **OK Gold_5-tone** | — | ● | ● | ● | ● | ● |
| **Black_5-tone** | — | ● | ● | ● | ● | ● |
- ● : 사용 가능 단계
- ○ : 사용 금지(명도 차이 20 % 미만)

> Tint 값은 HSL Lightness 또는 Opacity를 이용해 디지털·인쇄 모두 한정된 단계만 사용해 주세요.
> 

---

## 3. 실무 체크리스트

1. **새 아트워크**를 시작할 때 → 위 테이블의 Pantone·CMYK·HEX 값이 정확히 입력되었는지 검수
2. **Tone on Tone** 배색 시 → 명도 차이 ≥ 20 % / 단계 표에 없는 중간값 사용 금지
3. **Gold** 적용 시 → 대체 CMYK 인쇄 불가, 반드시 금박·무광 별색 처리
4. **간이 출력(사무실 프린터)** 용 시 → Pantone→CMYK 대체값 사용 + 교정 출력으로 색상 확인
5. **웹·모바일** 시 → HEX 값 기준, 다크모드 대응할 경우 명도 20 % 규칙 준수

---

### 부록 : 빠른 복사용 HEX 목록