# Remove email sender for successful build
_Exported on 6/8/2025 at 13:36:25 GMT+5:30 from Cursor (1.0.0)_

---

**User**

emailSender is not needed but with dummy, wasp build is not working

---

**Cursor**

Let me help you fix the email sender configuration in your Wasp application. Since you mentioned that the email sender is not needed and it's causing build issues with the Dummy provider, we can remove it entirely from the configuration.

I'll edit the `main.wasp` file to remove the `emailSender` section:


```plaintext
  client: {
    rootComponent: import App from "@src/client/App",
  },
}

//#region Auth Pages
// ... existing code ...
```

I've removed the `emailSender` configuration block from your `main.wasp` file. This should resolve the build issues you were experiencing. The email sender configuration is optional in Wasp, and since you mentioned it's not needed, removing it is the best solution.

You should now be able to build your application without the email sender-related errors. Let me know if you need any further assistance!

