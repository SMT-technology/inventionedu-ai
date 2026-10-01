import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 학년별 테스트 반 1개씩, 반마다 학생 8명. prisma/seed.sql과 같은 데이터다
// (Supabase SQL Editor에 그대로 붙여넣어 실행할 수 있도록 SQL 버전도 둔다).
const CLASSES = [
  {
    id: "class_g1",
    name: "1학년 1반 발명반",
    students: ["김민준", "이서연", "박도윤", "최지우", "정하은", "강시우", "조은우", "윤서아"],
  },
  {
    id: "class_g2",
    name: "2학년 1반 발명반",
    students: ["장하윤", "임지호", "한소율", "오준서", "서예은", "신도현", "권나은", "황건우"],
  },
  {
    id: "class_g3",
    name: "3학년 1반 발명반",
    students: ["안수아", "송민서", "전유준", "홍채원", "배현우", "노지안", "문서준", "양다인"],
  },
];

const STAGE_COUNT = 6;

async function main() {
  console.log("Seeding database...");

  await prisma.submission.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.class.deleteMany();

  const teacher = await prisma.user.create({
    data: { id: "teacher_1", email: "teacher1@inventedu.test", name: "김선생", role: "teacher" },
  });

  let n = 0;
  for (const c of CLASSES) {
    await prisma.class.create({ data: { id: c.id, teacherId: teacher.id, name: c.name } });

    for (const name of c.students) {
      n++;
      const student = await prisma.user.create({
        data: {
          id: `student_${n}`,
          email: `student${n}@inventedu.test`,
          name,
          role: "student",
          classId: c.id,
        },
      });

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
