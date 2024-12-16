# Shopify Remix App (TypeScript)

This Shopify app is built with [Remix](https://remix.run/) using TypeScript, offering robust product management features like adding products, updating SKUs, and managing statuses directly in the Shopify admin.

## Features

- **Add New Products**: Easily create products with titles, SKUs, and statuses.
- **Update Product SKU**: Seamlessly modify SKUs for existing products.
- **Update Product Status**: Change product statuses (Active, Draft, Archived) efficiently.
- **Pagination Support**: Navigate products using cursor-based pagination.
- **Clipboard Integration**: Quickly paste product IDs from the clipboard.

## Installation

1. **Generate the App**  
   Execute the command to initialize your Shopify app:
   ```bash
   npm init @shopify/app@latest
   ```
   Choose the following options:

   - Framework: Remix
   - TypeScript: Yes
   - App Name: Your desired app name

   Navigate to your app folder:
   ```bash
   cd <App Name>
   ```

2. **Run the Development Server**  
   Start the server with:
   ```bash
   npm run dev
   ```
   Follow the prompts to install the app in your Shopify store's admin.

## Project Structure

- **`package.json`**: Contains app dependencies and scripts.
- **`tsconfig.json`**: Configuration for TypeScript.
- **`routes/`**: Remix routes and components for product management:
  - `AddNewProduct.tsx`: Manages product creation.
  - `UpdateSKU.tsx`: Handles SKU updates.
  - `StatusUpdate.tsx`: Manages status updates.
  - `app.products.tsx`: Main product management interface.
  - `shopify.server.ts`: Server-side Shopify API interaction.

## Scripts

- **Development**: Start server.
  ```bash
  npm run dev
  ```
- **Build**: Compile for production.
  ```bash
  npm run build
  ```
- **Lint**: Run ESLint.
  ```bash
  npm run lint
  ```
- **Setup**: Initialize Prisma migrations.
  ```bash
  npm run setup
  ```

## Usage



// const accessToken = "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";
// const apiUrl = `https://teifi-jobs-68005ff9.myshopify.com/admin/api/${apiVersion}/graphql.json`;
// I did not had time to put them in .env files, as for now it will require to reqrite ol headers and promises.. 

- **Create Product**: `/api.create-product`
- **Update SKU**: `/api.update-sku`
- **Update Status**: `/api.status-update`



- **Add a New Product**: Click "Add New Product", fill details, and create.
- **Update SKU**: Click "Update SKU", enter details, and update.
- **Update Product Status**: Click "Update Status", choose a new status, and confirm.
- **Pagination**: Use navigation buttons to browse products.

## API Endpoints  - Serverside


## Client Side
-- **app.products.tsx
-- **app.tsx
-- **app.collections

## Prerequisites

- **Node.js**: Version 18.20+ or higher.
- **Shopify Partner Account**: Required for testing and deployment.
- **Access Token**: Obtain the admin API token from your Shopify store.

## Contributing

Contributions are welcome! Please:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch-name`).
3. Commit changes (`git commit -m "Description of changes"`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a pull request.

## License

Licensed under the MIT License. See the LICENSE file for details.
