-- 발명 메이커 랩 테스트 데이터 (prisma/seed.ts와 같은 구성)
-- 사용법: 아래 "여기를 바꾸세요" 두 줄에 교사 이메일과 비밀번호(10자 이상)를 넣고,
-- Supabase 대시보드 > SQL Editor에 전체를 붙여넣어 Run.
-- 기존 데이터는 모두 지워진다. 마지막 결과 표에 반 코드와 학생 PIN이 한 번만 나오니 따로 보관하세요.
-- 비밀번호와 PIN은 bcrypt 해시(pgcrypto)로만 저장된다.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DROP TABLE IF EXISTS pg_temp.seed_issued;
CREATE TEMP TABLE seed_issued (class_name TEXT, join_code TEXT, number INT, nickname TEXT, pin TEXT);

DO $$
DECLARE
  teacher_email    TEXT := 'teacher1@inventedu.test';   -- 여기를 바꾸세요
  teacher_password TEXT := 'CHANGE_ME_PASSWORD';        -- 여기를 바꾸세요
  classes TEXT[][] := ARRAY[
    ARRAY['class_g1', '1학년 1반 발명반'],
    ARRAY['class_g2', '2학년 1반 발명반'],
    ARRAY['class_g3', '3학년 1반 발명반']
  ];
  nicknames TEXT[] := ARRAY[
    '번개','햇살','바람','구름','별빛','파도','새싹','무지개',
    '달빛','노을','이슬','단풍','솔방울','다람쥐','고래','펭귄',
    '부엉이','여우','수달','해바라기','민들레','토끼','거북','반딧불'
  ];
  code_chars TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c INT; i INT; s INT; n INT := 0; lvl INT;
  code TEXT; student_pin TEXT; sid TEXT;
BEGIN
  IF teacher_password = 'CHANGE_ME_PASSWORD' OR length(teacher_password) < 10 THEN
    RAISE EXCEPTION '교사 비밀번호(10자 이상)를 먼저 바꾸고 실행하세요.';
  END IF;

  DELETE FROM "ChatMessage";
  DELETE FROM "Submission";
  DELETE FROM "Progress";
  -- User.classId와 Class.teacherId가 서로를 가리키므로 연결을 먼저 끊는다
  UPDATE "User" SET "classId" = NULL;
  DELETE FROM "Class";
  DELETE FROM "User";

  INSERT INTO "User" (id, email, name, role, "passwordHash")
  VALUES ('teacher_1', lower(teacher_email), '담당 교사', 'teacher',
          extensions.crypt(teacher_password, extensions.gen_salt('bf', 10)));

  FOR c IN 1..3 LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(code_chars, 1 + floor(random() * length(code_chars))::INT, 1);
    END LOOP;
    INSERT INTO "Class" (id, "teacherId", name, "joinCode")
    VALUES (classes[c][1], 'teacher_1', classes[c][2], code);

    FOR i IN 1..8 LOOP
      n := n + 1;
      sid := 'student_' || n;
      student_pin := lpad(floor(random() * 1000000)::INT::TEXT, 6, '0');
      INSERT INTO "User" (id, name, number, role, "classId", "pinHash")
      VALUES (sid, nicknames[n], i, 'student', classes[c][1],
              extensions.crypt(student_pin, extensions.gen_salt('bf', 10)));
      INSERT INTO seed_issued VALUES (classes[c][2], code, i, nicknames[n], student_pin);

      -- 학생마다 진행 정도를 다르게 (0~6단계)
      lvl := n % 7;
      FOR s IN 1..6 LOOP
        INSERT INTO "Progress" (id, "userId", stage, status, "updatedAt")
        VALUES ('progress_' || sid || '_' || s, sid, s,
                CASE WHEN s < lvl THEN 'done' WHEN s = lvl THEN 'in_progress' ELSE 'not_started' END,
                NOW());
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

SELECT * FROM seed_issued ORDER BY class_name, number;
