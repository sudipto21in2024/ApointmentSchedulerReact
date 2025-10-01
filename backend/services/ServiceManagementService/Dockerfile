FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/ServiceManagementService/ServiceManagementService.csproj", "./"]
RUN dotnet restore "./ServiceManagementService.csproj"
COPY . .
WORKDIR "/src/backend/services/ServiceManagementService"
RUN dotnet build "ServiceManagementService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "ServiceManagementService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "ServiceManagementService.dll"]