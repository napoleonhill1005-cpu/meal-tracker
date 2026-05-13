# 식단 트래커 PWA 배포 가이드

폰 홈 화면에 박는 데까지 약 15-20분.

## 준비물

- GitHub 계정 (없으면 https://github.com 가입)
- Vercel 계정 (없으면 https://vercel.com 가입 — GitHub으로 로그인 가능)
- PC

---

## 1단계 · GitHub에 코드 올리기

### 1-A. 새 저장소 만들기

1. https://github.com/new 접속
2. **Repository name**: `meal-tracker` (아무거나 가능)
3. **Public** 선택 (Private도 되지만 Public이 편함)
4. **Create repository** 클릭

### 1-B. 코드 업로드

가장 쉬운 방법은 **"uploading an existing file"** 링크 클릭:

1. 만든 저장소 페이지 중간에 **"uploading an existing file"** 링크 클릭
2. `meal-app` 폴더 안의 파일/폴더를 **드래그해서 올림**
   - `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`
   - `src/` 폴더 (App.jsx, main.jsx, index.css)
   - `public/` 폴더 (manifest.json, icon-192.png, icon-512.png, icon.svg)
   - **`node_modules` 폴더는 올리지 마세요** (용량 큼, 자동 생성됨)
3. 페이지 맨 아래 **Commit changes** 클릭

---

## 2단계 · Vercel에 배포

1. https://vercel.com/new 접속
2. **Import Git Repository** 섹션에서 방금 만든 `meal-tracker` 선택
3. 설정 화면이 뜨면 그냥 **Deploy** 클릭 (다 자동 인식됨)
4. 30초~1분 기다리면 배포 완료
5. 화면에 뜨는 **`xxx.vercel.app`** URL 복사

---

## 3단계 · 폰 홈 화면에 박기

### 아이폰 (Safari)

1. Safari로 Vercel URL 열기
2. 하단 **공유 버튼** (네모에 위로 화살표) 탭
3. **"홈 화면에 추가"** 탭
4. 이름 확인 후 **추가** 탭
5. 홈 화면에 아이콘 박힘 → 탭하면 풀스크린 앱처럼 열림

### 안드로이드 (Chrome)

1. Chrome으로 Vercel URL 열기
2. 우측 상단 **⋮ 메뉴** 탭
3. **"홈 화면에 추가"** 또는 **"앱 설치"** 탭
4. 추가 → 홈 화면에 박힘

---

## 업데이트는 자동

코드 수정하고 GitHub에 푸시하면 → Vercel이 알아서 새 버전 빌드 → 폰에서 앱 열 때 **자동으로 최신 버전 로딩됨**.

- 앱스토어 업데이트 같은 거 안 해도 됨
- 저장된 데이터(재고/캘린더/끼니 체크)는 그대로 유지됨

업데이트 방법:
1. GitHub에서 파일 클릭 → 연필 아이콘으로 편집 → Commit
2. 또는 새 파일 드래그 업로드
3. Vercel이 자동으로 1분 안에 반영

---

## 자주 묻는 거

**Q. 인터넷 없으면 안 되나?**  
A. 첫 로딩 후에는 작동해요. 데이터도 폰에 저장되니까 비행기 모드에서도 OK.

**Q. 폰 바꾸면 데이터 날아가나?**  
A. 네, localStorage라 폰별로 따로 저장돼요. 백업 기능 필요하면 추후 추가 가능.

**Q. 푸시 알림 받고 싶다**  
A. iOS는 PWA 푸시 제약 있음. 안드로이드는 가능. 필요하면 따로 작업해야 함.

**Q. 도메인 예쁘게 바꾸고 싶다**  
A. Vercel 프로젝트 설정에서 커스텀 도메인 연결 가능. 도메인은 따로 사야 함 (가비아·Namecheap 등).

---

## 코드 수정하고 싶을 때

`src/App.jsx` 안에 있는 거:

- **`ITEMS` 배열**: 품목 추가/제거/임계점 조정
- **`MEAL_PLAN`**: 식단표 변경
- **`MACROS`**: 매크로 목표 수치
- **`LEAD_TIME_DAYS`**: 배송 버퍼일 (현재 2일)

수정 → GitHub 푸시 → 1분 후 폰에서 자동 반영.
