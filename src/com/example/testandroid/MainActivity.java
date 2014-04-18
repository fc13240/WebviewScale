package com.example.testandroid;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.app.AlertDialog.Builder;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.DialogInterface.OnClickListener;
import android.graphics.Bitmap;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
public class MainActivity extends Activity {

	private WebView webView;
	private ProgressDialog progressDialog;
	private static ConnectivityManager manager ;
	private Boolean urlStateCanBack = true;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		webView = (WebView) findViewById(R.id.mywebview);
		setWebView();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}
	@SuppressWarnings("deprecation")
	@SuppressLint({ "NewApi", "SetJavaScriptEnabled" })
	private void setWebView() {
		if (Build.VERSION.SDK_INT >= 16) {
			Class<?> clazz = webView.getSettings().getClass();
			Method method = null;
			try {
				method = clazz.getMethod("setAllowUniversalAccessFromFileURLs",
						boolean.class);
			} catch (NoSuchMethodException e1) {
				e1.printStackTrace();
			}
			if (method != null) {
				try {
					method.invoke(webView.getSettings(), true);
				} catch (IllegalArgumentException e) {
					e.printStackTrace();
				} catch (IllegalAccessException e) {
					e.printStackTrace();
				} catch (InvocationTargetException e) {
					e.printStackTrace();
				}
			}
		}
		webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
//		webView.setInitialScale(100);
//		webView.clearCache(true);
		webView.setVerticalScrollBarEnabled(false);
		webView.setHorizontalScrollBarEnabled(false);
//		webView.enablecrossdomain41();
	       

		// 此视图设置过滚动模式。
//		webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
//		webView.setHorizontalScrollBarEnabled(false);

		WebSettings webSettings = webView.getSettings();
		webSettings.setSavePassword(false);
		webSettings.setSaveFormData(false);
		webSettings.setJavaScriptEnabled(true);
		webSettings.setSupportZoom(false);
		
		// 设置本地缓存
		webSettings.setDomStorageEnabled(true);// 设置本地缓存
		webSettings.setAllowFileAccess(false);
		webSettings.setDatabaseEnabled(true);
		String dir = this.getApplicationContext()
				.getDir("database", MODE_PRIVATE).getPath();
		webSettings.setDatabasePath(dir);
		webSettings.setAllowFileAccess(false);
		webSettings.setNeedInitialFocus(false);
		// webSettings.setDomStorageEnabled(true);

		//启用地理定位 
		webSettings.setGeolocationEnabled(true); 
		//设置定位的数据库路径 
		webSettings.setGeolocationDatabasePath(dir); 
		
		int screenDensity = getResources().getDisplayMetrics().densityDpi ;   
		WebSettings.ZoomDensity zoomDensity = WebSettings.ZoomDensity.MEDIUM ;   
		switch (screenDensity){   
		case DisplayMetrics.DENSITY_LOW :  
		    zoomDensity = WebSettings.ZoomDensity.CLOSE;  
		    break;  
		case DisplayMetrics.DENSITY_MEDIUM:  
		    zoomDensity = WebSettings.ZoomDensity.MEDIUM;  
		    break;  
		case DisplayMetrics.DENSITY_HIGH:  
		    zoomDensity = WebSettings.ZoomDensity.FAR;  
		    break ;  
		}  
		webSettings.setDefaultZoom(zoomDensity);  
		// webView.addJavascriptInterface(this, "android");
		// 对js提供接口
		class JsObject{
			@JavascriptInterface
			public void setNoBack(){
				urlStateCanBack = false;
			}
			@JavascriptInterface
			public void setCanBack(){
				urlStateCanBack = true;
			}
			@JavascriptInterface
			public void alert(final String message){
				AlertDialog alertDialog = new Builder(MainActivity.this).create();
				alertDialog.setTitle("系统提示：");
				alertDialog.setMessage(message);
				alertDialog.setButton(DialogInterface.BUTTON_POSITIVE, "确定",new OnClickListener(){
					@Override
					public void onClick(DialogInterface arg0, int arg1) {
						
					}
				});
				alertDialog.show();
			}
			@JavascriptInterface
			public boolean isCanUseNetwork(){
				if(null == manager){
					manager = (ConnectivityManager)getSystemService(Context.CONNECTIVITY_SERVICE); 
				}
				if(null != manager){
					NetworkInfo networkinfo = manager.getActiveNetworkInfo();
					if (networkinfo != null && networkinfo.isAvailable()) { 
						Log.i("isCanUseNetwork","true");
			           return true;
					} 
				}
				return false;
			}
		}
		webView.addJavascriptInterface(new JsObject(), "injectedObject");
		
		MyWebViewClient myWebViewClient = new MyWebViewClient(this);
		progressDialog = myWebViewClient.getProgressDialog();
		webView.setWebViewClient(myWebViewClient);
		webView.setWebChromeClient(new MyWebChromeClient(progressDialog));
		webView.loadUrl("file:///android_asset/index.html");
	}
}
class MyWebViewClient extends WebViewClient {
	private Context context;
	private ProgressDialog dialog;
	public MyWebViewClient() {
 	}
	public MyWebViewClient(Context context) {
		this.context = context;
		dialog = new ProgressDialog(context);
		dialog.setCancelable(true);
		dialog.setMessage("数据加载中...");
	}
	
	public ProgressDialog getProgressDialog(){
		return dialog;
	}
	public void startChinaWeahterClient(String cityId, int action,Context context) {
		final String SKIP_CURRENT_CITY = "SKIP_CURRENT_CITY"; // 跳转到当前城市界面
		final String PACKAGE_NAME = "com.pmsc.chinaweather"; // 调用程序的包名
		final String CLASS_NAME = "com.pmsc.chinaweather.service.WidgetService"; // 调用的类名
		Intent intent = new Intent();
		intent.putExtra("CITY_ID", cityId);
		intent.setClassName(PACKAGE_NAME, CLASS_NAME);
		switch (action) {
		case 0:
			intent.putExtra("ACTION", SKIP_CURRENT_CITY);
			break;
		default: // 默认跳转到当前城市界面
			intent.putExtra("ACTION", SKIP_CURRENT_CITY);
			break;
		}
		context.startService(intent);
	}

	@Override
	public void onPageFinished(WebView view, String url) {
		super.onPageFinished(view, url);
	}

	@Override
	public void onPageStarted(WebView view, String url, Bitmap favicon) {
		super.onPageStarted(view, url, favicon);
	}

	/**
	 * 获取webview跳转的链接
	 */
	@Override
	public boolean shouldOverrideUrlLoading(WebView view, String url) {
		// pImg图片,sTel电话,pMap地图(GIS),pUrl外部链接
		String startWith = url.substring(0, 4);
		
		
		Log.e("url  ", "url  " + url);

		return true;
	}
	
	
}


class MyWebChromeClient extends WebChromeClient {
	private ProgressDialog dialog;
	public MyWebChromeClient(){
	}
	public MyWebChromeClient(ProgressDialog dialog){
		this.dialog = dialog;
	}
	@Override
	public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
		return super.onConsoleMessage(consoleMessage);
	}

	@Override
	public boolean onJsAlert(WebView view, String url, String message,
			JsResult result) {
		return super.onJsAlert(view, url, message, result);
	}

	@Override
	public void onGeolocationPermissionsShowPrompt(String origin, 
		GeolocationPermissions.Callback callback) { 
		callback.invoke(origin, true, false); 
		super.onGeolocationPermissionsShowPrompt(origin, callback); 
	} 
	@Override
	/*处理进度条*/
	public void onProgressChanged(WebView view, int newProgress) {
		if(null != dialog){
			if(70 <= newProgress){
				dialog.dismiss();
			}else{
				if(!dialog.isShowing()){
					dialog.show();
				}
			}
		}
		Log.i("progress",""+newProgress+view.getUrl());
        super.onProgressChanged(view, newProgress);
    }
}