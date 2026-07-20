import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma.js';

async function main() {
  console.log('Iniciando el seeding de la base de datos (con muchos más datos)...');

  // Limpiar base de datos
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear usuarios (Admin y Varios Clientes)
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { name: 'Admin Principal', email: 'admin@nina.com', password: passwordHash, role: 'ADMIN' },
  });

  const clients = await Promise.all([
    prisma.user.create({ data: { name: 'Juan Perez', email: 'juan@test.com', password: passwordHash, role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Maria Gomez', email: 'maria@test.com', password: passwordHash, role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Carlos Ruiz', email: 'carlos@test.com', password: passwordHash, role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Ana Lopez', email: 'ana@test.com', password: passwordHash, role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Luis Torres', email: 'luis@test.com', password: passwordHash, role: 'CLIENT' } }),
  ]);

  console.log(`Usuarios creados: 1 ADMIN, ${clients.length} CLIENTES.`);

  // 2. Crear Productos
  const productsData = [
    { name: 'Pan de Masa Madre (Ayer)', description: 'Perfecto para tostar.', originalPrice: 6.0, currentPrice: 2.0, stock: 15 },
    { name: 'Mix de Verduras (Borde de fecha)', description: 'Ideal para caldos y sopas.', originalPrice: 4.5, currentPrice: 1.5, stock: 20 },
    { name: 'Yogurt Griego Fresa', description: 'Próximo a vencer en 2 días.', originalPrice: 3.0, currentPrice: 1.0, stock: 30 },
    { name: 'Caja de Donas Variadas', description: 'Donas del final del turno.', originalPrice: 12.0, currentPrice: 4.0, stock: 5 },
    { name: 'Pollo Asado (Restos del día)', description: 'Se debe consumir hoy mismo.', originalPrice: 15.0, currentPrice: 6.0, stock: 8 },
    { name: 'Ensalada César', description: 'Preparada esta mañana.', originalPrice: 7.0, currentPrice: 2.5, stock: 12 },
    { name: 'Tarta de Manzana (Porciones)', description: 'Últimas porciones de la vitrina.', originalPrice: 4.0, currentPrice: 1.5, stock: 10 },
    { name: 'Pack de Plátanos maduros', description: 'Excelentes para pan de banano.', originalPrice: 2.5, currentPrice: 0.8, stock: 25 },
    { name: 'Jugo de Naranja Natural', description: 'Hecho hoy temprano.', originalPrice: 3.5, currentPrice: 1.2, stock: 18 },
    { name: 'Sandwich de Jamón y Queso', description: 'Empacado, cerca de fecha de expiración.', originalPrice: 5.0, currentPrice: 2.0, stock: 15 },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        ...p,
        adminId: admin.id,
        expirationDate: new Date(new Date().getTime() + Math.random() * 72 * 60 * 60 * 1000), // Vencen en 0 a 72 hrs
      },
    });
    products.push(product);
  }

  console.log(`Productos creados: ${products.length}.`);

  // 3. Crear Ofertas (para 5 productos aleatorios)
  const offersData = [];
  for (let i = 0; i < 5; i++) {
    const offer = await prisma.offer.create({
      data: {
        productId: products[i].id,
        discountPercentage: Math.floor(Math.random() * 50) + 10, // 10% a 59% extra descuento
        endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Mañana
      },
    });
    offersData.push(offer);
  }

  console.log(`Ofertas creadas: ${offersData.length}.`);

  // 4. Crear Pedidos para los clientes
  const statuses = ['PENDING', 'COMPLETED', 'CANCELLED'];
  let orderCount = 0;

  for (const client of clients) {
    // Cada cliente hace 2 pedidos
    for (let i = 0; i < 2; i++) {
      const selectedProducts = [products[Math.floor(Math.random() * products.length)], products[Math.floor(Math.random() * products.length)]];
      
      const orderItemsData = selectedProducts.map(p => ({
        productId: p.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        priceAtPurchase: p.currentPrice,
      }));

      const totalAmount = orderItemsData.reduce((acc, item) => acc + item.quantity * item.priceAtPurchase, 0);
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as "PENDING" | "COMPLETED" | "CANCELLED";

      await prisma.order.create({
        data: {
          clientId: client.id,
          totalAmount,
          status: randomStatus,
          orderItems: { create: orderItemsData },
        },
      });
      orderCount++;
    }
  }

  console.log(`Pedidos creados: ${orderCount}.`);
  console.log('¡Seeding masivo a Supabase completado exitosamente! 🚀');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
