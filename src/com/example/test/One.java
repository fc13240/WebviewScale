package com.example.test;

import org.json.JSONException;
import org.json.JSONObject;

public class One {
	public static void main(String[] args){
		String name = new String("test");
		JSONObject obj = new JSONObject();
		try {
			obj.put("t", "test");
			System.out.print(name == obj.getString("t"));
			System.out.print(name.equals(obj.getString("t")));
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
}