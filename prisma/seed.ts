import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 학년별 테스트 반 1개씩, 반마다 학생 8명. prisma/seed.sql과 같은 구성이다
// (Supabase SQL Editor에 그대로 붙여넣어 실행할 수 있도록 SQL 버전도 둔다).
// 개인정보 최소 수집: 학생은 실명 대신 번호 + 별명만 쓰고 이메일이 없다.
const CLASSES = [
  { id: "class_g1", name: "1학년 1반 발명반", students: ["번개", "햇살", "바람", "구름", "별빛", "파도", "새싹", "무지개"] },
  { id: "class_g2", name: "2학년 1반 발명반", students: ["달빛", "노을", "이슬", "단풍", "솔방울", "다람쥐", "고래", "펭귄"] },
  { id: "class_g3", name: "3학년 1반 발명반", students: ["부엉이", "여우", "수달", "해바라기", "민들레", "토끼", "거북", "반딧불"] },
];

const STAGE_COUNT = 6;
// 헷갈리기 쉬운 글자(0/O, 1/I/L)를 뺀 반 코드용 글자
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function joinCode() {
  return Array.from({ length: 6 }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join("");
}

function pin() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

async function main() {
  const teacherEmail = (process.env.SEED_TEACHER_EMAIL ?? "teacher1@inventedu.test").toLowerCase();
  const teacherPassword = process.env.SEED_TEACHER_PASSWORD;
  if (!teacherPassword || teacherPassword.length < 10) {
    throw new Error("SEED_TEACHER_PASSWORD(10자 이상)를 환경변수로 넣고 실행하세요.");
  }

  console.log("Seeding database...");

  await prisma.chatMessage.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.progress.deleteMany();
  // User.classId와 Class.teacherId가 서로를 가리키므로 연결을 먼저 끊는다
  await prisma.user.updateMany({ data: { classId: null } });
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const teacher = await prisma.user.create({
    data: {
      id: "teacher_1",
      email: teacherEmail,
      name: "담당 교사",
      role: "teacher",
      passwordHash: await bcrypt.hash(teacherPassword, 10),
    },
  });

  const issued: { class: string; joinCode: string; number: number; name: string; pin: string }[] = [];
  let n = 0;
  for (const c of CLASSES) {
    const code = joinCode();
    await prisma.class.create({ data: { id: c.id, teacherId: teacher.id, name: c.name, joinCode: code } });

    for (const [i, name] of c.students.entries()) {
      n++;
      const studentPin = pin();
      const student = await prisma.user.create({
        data: {
          id: `student_${n}`,
          name,
          number: i + 1,
          role: "student",
          classId: c.id,
          pinHash: await bcrypt.hash(studentPin, 10),
        },
      });
      issued.push({ class: c.name, joinCode: code, number: i + 1, name, pin: studentPin });

      // 학생마다 진행 정도를 다르게 (0~6단계) 해서 교사 화면을 확인하기 쉽게 한다.
      const level = n % (STAGE_COUNT + 1);
      for (let stage = 1; stage <= STAGE_COUNT; stage++) {
        const status = stage < level ? "done" : stage === level ? "in_progress" : "not_started";
        await prisma.progress.create({
          data: { id: `progress_${student.id}_${stage}`, userId: student.id, stage, status },
        });
      }
    }
  }

  console.log("Seed complete:", { teacher: teacher.email, classes: CLASSES.length, students: n });
  console.log("학생 로그인 정보(이 화면에서만 보이니 따로 보관하세요):");
  console.table(issued);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
