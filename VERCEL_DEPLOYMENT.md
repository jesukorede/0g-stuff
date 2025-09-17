# Vercel Deployment Guide

This guide provides instructions for deploying the 0G Inference INFT application to Vercel.

## Prerequisites

- A Vercel account
- Git repository with your project
- Node.js and npm installed locally

## Deployment Steps

1. **Push your code to a Git repository**
   - GitHub, GitLab, or Bitbucket

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign in with your account
   - Click "New Project"
   - Import your Git repository

3. **Configure project settings**
   - Select the repository
   - Configure the following settings:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: npm run build
     - Output Directory: .next

4. **Environment Variables**
   - Add the following environment variables:
     - `NEXT_PUBLIC_INFT_CONTRACT_ADDRESS`: Your deployed INFT contract address
     - `NEXT_PUBLIC_CHAIN_ID`: The chain ID for your deployment (e.g., 1 for Ethereum mainnet)

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

## Post-Deployment

After deployment, you'll need to:

1. **Update contract addresses**
   - Ensure the contract addresses in `src/constants/addresses.ts` match your deployed contracts

2. **Test the application**
   - Test all functionality in the deployed environment
   - Verify wallet connections work correctly
   - Test INFT transfers and authorizations

## Troubleshooting

If you encounter issues:

1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Ensure all dependencies are properly installed
4. Check for any API rate limiting issues

## Continuous Deployment

Vercel automatically deploys when you push changes to your repository. To disable this:

1. Go to your project settings
2. Navigate to Git Integration
3. Disable "Auto Deploy"