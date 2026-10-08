import { PrismaClient } from "@prisma/client";
import { STEP_NUMBERS } from "../lib/steps";

const prisma = new PrismaClient();

// 테스트 반 1개, 학생 8명(2인 1조 4팀). prisma/seed.sql과 같은 데이터다
// (Supabase SQL Editor에 그대로 붙여넣어 실행할 수 있도록 SQL 버전도 둔다).
const CLASS = { id: "class_1", name: "1학년 1반 로봇팔반" };
const STUDENTS = ["김민준", "이서연", "박도윤", "최지우", "정하은", "강시우", "조은우", "윤서아"];

async function main() {
  console.log("Seeding database...");

  await prisma.progress.deleteMany();
  await prisma.user.updateMany({ data: { classId: null, teamId: null } });
  await prisma.team.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { id: "teacher_1", email: "teacher1@robotarm.test", name: "김선생", role: "teacher" },
  });
  await prisma.class.create({ data: { ...CLASS, teacherId: "teacher_1" } });

  for (let t = 0; t < STUDENTS.length / 2; t++) {
    await prisma.team.create({ data: { id: `team_${t + 1}`, classId: CLASS.id, name: `${t + 1}모둠` } });
  }

  for (const [i, name] of STUDENTS.entries()) {
    const n = i + 1;
    await prisma.user.create({
      data: {
        id: `student_${n}`,
        email: `student${n}@robotarm.test`,
        name,
        role: "student",
        classId: CLASS.id,
        teamId: `team_${Math.floor(i / 2) + 1}`,
        progress: { create: STEP_NUMBERS.map((step) => ({ id: `progress_student_${n}_${step}`, step })) },
      },
    });
  }

  console.log(`Seeded 1 teacher, 1 class, ${STUDENTS.length / 2} teams, ${STUDENTS.length} students.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
