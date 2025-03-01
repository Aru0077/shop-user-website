// src/types/api.type.ts

/**
 * API 通用响应接口
 * 与后端 sendSuccess/sendError 方法对应
 */
export interface ApiResponse<T = any> {
      success: boolean;
      message: string;
      data: T;
  }
  
  /**
   * API 错误类型
   * 与后端 AppError 对应
   */
  export interface ApiError {
      statusCode: number;
      status: string;
      message: string;
      stack?: string;
  }
  
  /**
   * 分页数据结构
   */
  export interface PaginatedData<T> {
      items: T[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
  }
  
  /**
   * HTTP 状态码
   */
  export enum HttpStatus {
      OK = 200,
      BAD_REQUEST = 400,
      UNAUTHORIZED = 401,
      FORBIDDEN = 403,
      NOT_FOUND = 404,
      INTERNAL_SERVER_ERROR = 500
  }