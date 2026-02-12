import { NextResponse } from 'next/server';
import { withTracing } from '@/shared/lib/with-tracing';
import { allow } from '@/shared/lib/rbac';
import { verifyCsrf } from '@/shared/lib/verify-csrf';
import { logActivity } from '@/shared/lib/log-activity';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

export const POST = withTracing(async (req, ctx) => {
  const { requestId, latency } = ctx;

  // CSRF
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  // RBAC — только сотрудники, которые могут управлять товарами
  const staff = await allow.manageProducts(req);
  if (!staff) {
    return NextResponse.json(
      { error: 'Forbidden', requestId },
      { status: 403 },
    );
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: 'File is required', requestId },
      { status: 400 },
    );
  }

  // Создаём директорию, если нет
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'temp');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Генерируем имя файла
  const ext = file.name.split('.').pop();
  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  // Сохраняем файл
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  const url = `/uploads/temp/${filename}`;

  // Логируем
  await logActivity(staff.id, 'upload_temp_image', req, {
    filename,
    latencyMs: latency,
  });

  return NextResponse.json(
    {
      url,
      requestId,
    },
    { status: 200 },
  );
});
