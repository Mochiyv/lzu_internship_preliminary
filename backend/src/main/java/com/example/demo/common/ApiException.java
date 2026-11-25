package com.example.demo.common;

import org.springframework.http.HttpStatus;

/**
 * 业务异常：由 {@link GlobalExceptionHandler} 转成统一响应，带 HTTP 状态与业务码。
 */
public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final int code;

	public ApiException(HttpStatus status, int code, String message) {
		super(message);
		this.status = status;
		this.code = code;
	}

	public HttpStatus getStatus() {
		return status;
	}

	public int getCode() {
		return code;
	}

	/** 400 + 40001：参数校验失败 */
	public static ApiException badRequest(String message) {
		return new ApiException(HttpStatus.BAD_REQUEST, ApiResponse.CODE_BAD_REQUEST, message);
	}

	/** 404 + 40401：资源不存在 */
	public static ApiException notFound(String message) {
		return new ApiException(HttpStatus.NOT_FOUND, ApiResponse.CODE_NOT_FOUND, message);
	}
}
