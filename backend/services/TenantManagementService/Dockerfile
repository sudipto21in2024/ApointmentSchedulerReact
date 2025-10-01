FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/TenantManagementService/TenantManagementService.csproj", "./"]
RUN dotnet restore "./TenantManagementService.csproj"
COPY . .
WORKDIR "/src/backend/services/TenantManagementService"
RUN dotnet build "TenantManagementService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "TenantManagementService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "TenantManagementService.dll"]