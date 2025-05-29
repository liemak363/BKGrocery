export async function login(name: string, password: string) {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          password,
        }),
      }
    );

    if (res.status === 403) {
      throw new Error("Tài khoản hoặc mật khẩu không đúng!");
    }

    if (!res.ok) {
      throw new Error("Đăng nhập không thành công, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}

export async function signup(name: string, password: string) {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          password,
        }),
      }
    );

    if (res.status === 406) {
      throw new Error("Tài khoản đã tồn tại!");
    }

    if (!res.ok) {
      throw new Error("Đăng ký không thành công, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}

export async function logout(accessToken: string, refreshToken?: string) {
  try {
    let body: any = {};
    if (refreshToken && refreshToken !== "" && refreshToken !== null) {
      body.refreshToken = refreshToken;
    }
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: body,
      }
    );

    if (!res.ok) {
      throw new Error("Đăng xuất không thành công, xin thử lại");
    }

    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export async function newAccessToken(refreshToken: string) {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}auth/newAccessToken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Lấy token mới không thành công, xin thử lại");
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error("New access token error:", error);
    throw new Error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}
