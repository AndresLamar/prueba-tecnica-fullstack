import type { NextApiRequest, NextApiResponse } from 'next';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Prueba Técnica Fullstack API',
    version: '1.0.0',
    description: 'API REST para movimientos, usuarios y reportes con Better Auth y RBAC.',
  },
  servers: [
    {
      url: '/api',
      description: 'Base URL relativa para entorno local y Vercel',
    },
  ],
  tags: [
    { name: 'Movements', description: 'Gestión de ingresos y egresos' },
    { name: 'Users', description: 'Gestión de usuarios (solo admin)' },
    { name: 'Reports', description: 'Reportes financieros y descarga CSV' },
  ],
  security: [{ sessionCookie: [] }],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'better-auth.session_token',
        description: 'Cookie de sesión emitida por Better Auth',
      },
    },
    schemas: {
      MovementType: {
        type: 'string',
        enum: ['INCOME', 'EXPENSE'],
        example: 'INCOME',
      },
      Role: {
        type: 'string',
        enum: ['USER', 'ADMIN'],
        example: 'ADMIN',
      },
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string', example: 'Authentication required' },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', example: 'clx_user_123' },
          name: { type: 'string', example: 'Andres Lopez' },
          email: { type: 'string', format: 'email', example: 'andres@email.com' },
          phone: { type: 'string', nullable: true, example: '+57 3001234567' },
          role: { $ref: '#/components/schemas/Role' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      MovementUser: {
        type: 'object',
        required: ['id', 'name', 'email'],
        properties: {
          id: { type: 'string', example: 'clx_user_123' },
          name: { type: 'string', example: 'Andres Lopez' },
          email: { type: 'string', format: 'email', example: 'andres@email.com' },
        },
      },
      Movement: {
        type: 'object',
        required: ['id', 'concept', 'amount', 'date', 'type', 'userId', 'user', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', example: 'clx_mov_456' },
          concept: { type: 'string', example: 'Pago de proveedor' },
          amount: { type: 'number', example: 250000 },
          date: { type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000Z' },
          type: { $ref: '#/components/schemas/MovementType' },
          userId: { type: 'string', example: 'clx_user_123' },
          user: { $ref: '#/components/schemas/MovementUser' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateMovementInput: {
        type: 'object',
        required: ['concept', 'amount', 'date', 'type'],
        properties: {
          concept: { type: 'string', example: 'Venta de contado' },
          amount: { type: 'number', minimum: 0.01, example: 1200000 },
          date: { type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000Z' },
          type: { $ref: '#/components/schemas/MovementType' },
          userId: {
            type: 'string',
            description: 'Opcional. Si se omite, usa el usuario autenticado.',
            example: 'clx_user_123',
          },
        },
      },
      UpdateMovementInput: {
        type: 'object',
        properties: {
          concept: { type: 'string', example: 'Pago proveedor actualizado' },
          amount: { type: 'number', minimum: 0.01, example: 300000 },
          date: { type: 'string', format: 'date-time', example: '2026-02-23T12:00:00.000Z' },
          type: { $ref: '#/components/schemas/MovementType' },
          userId: { type: 'string', example: 'clx_user_123' },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Nombre Actualizado' },
          role: { $ref: '#/components/schemas/Role' },
        },
      },
      ReportSummary: {
        type: 'object',
        required: ['incomeTotal', 'expenseTotal', 'balance'],
        properties: {
          incomeTotal: { type: 'number', example: 4200000 },
          expenseTotal: { type: 'number', example: 1150000 },
          balance: { type: 'number', example: 3050000 },
        },
      },
      ReportChart: {
        type: 'object',
        required: ['labels', 'values'],
        properties: {
          labels: {
            type: 'array',
            items: { type: 'string' },
            example: ['Ingresos', 'Egresos'],
          },
          values: {
            type: 'array',
            items: { type: 'number' },
            example: [4200000, 1150000],
          },
        },
      },
      ReportResponse: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            required: ['summary', 'chart', 'movements'],
            properties: {
              summary: { $ref: '#/components/schemas/ReportSummary' },
              chart: { $ref: '#/components/schemas/ReportChart' },
              movements: {
                type: 'array',
                items: { $ref: '#/components/schemas/Movement' },
              },
            },
          },
        },
      },
      MovementDeletedResponse: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            required: ['id', 'deleted'],
            properties: {
              id: { type: 'string', example: 'clx_mov_456' },
              deleted: { type: 'boolean', example: true },
            },
          },
        },
      },
    },
  },
  paths: {
    '/movements': {
      get: {
        tags: ['Movements'],
        summary: 'Listar movimientos',
        description:
          'ADMIN y USER autenticados pueden ver todos los movimientos. USER no puede editar ni eliminar movimientos.',
        parameters: [
          {
            in: 'query',
            name: 'type',
            schema: { $ref: '#/components/schemas/MovementType' },
            required: false,
            description: 'Filtrar por tipo de movimiento.',
          },
        ],
        responses: {
          200: {
            description: 'Listado de movimientos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movement' },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Parámetro inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Movements'],
        summary: 'Crear movimiento',
        description: 'Solo ADMIN puede crear movimientos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMovementInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Movimiento creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Movement' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado (solo admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/movements/{id}': {
      get: {
        tags: ['Movements'],
        summary: 'Obtener movimiento por ID',
        description: 'Solo ADMIN.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Movimiento encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Movement' },
                  },
                },
              },
            },
          },
          400: {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado (solo admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Movimiento no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Movements'],
        summary: 'Actualizar movimiento',
        description: 'Solo ADMIN puede actualizar movimientos.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMovementInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Movimiento actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Movement' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado (solo admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Movements'],
        summary: 'Eliminar movimiento',
        description: 'Solo ADMIN y únicamente si el movimiento le pertenece.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Movimiento eliminado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MovementDeletedResponse' },
              },
            },
          },
          400: {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'Admin sin ownership del movimiento',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Movimiento no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios',
        description: 'Solo ADMIN puede listar usuarios.',
        responses: {
          200: {
            description: 'Listado de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado (solo admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obtener usuario por ID',
        description: 'Solo ADMIN.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Usuario encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'ID inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado (solo admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Actualizar usuario',
        description: 'Solo ADMIN puede actualizar nombre y rol.',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuario actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado (solo admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/reports': {
      get: {
        tags: ['Reports'],
        summary: 'Obtener reporte financiero',
        description: 'Solo ADMIN. Devuelve resumen, gráfico y movimientos o CSV.',
        parameters: [
          {
            in: 'query',
            name: 'format',
            required: false,
            schema: { type: 'string', enum: ['csv'] },
            description: 'Usa format=csv para descargar archivo CSV.',
          },
        ],
        responses: {
          200: {
            description: 'Reporte JSON o archivo CSV',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReportResponse' },
              },
              'text/csv': {
                schema: {
                  type: 'string',
                  example:
                    'concepto,tipo,monto,fecha,nombreUsuario,emailUsuario\n"Venta",Ingreso,100000.00,2026-02-23T12:00:00.000Z,"Andres","andres@email.com"',
                },
              },
            },
          },
          401: {
            description: 'No autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado (solo admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed. Use: GET' });
    return;
  }

  res.status(200).json(openApiSpec);
}
