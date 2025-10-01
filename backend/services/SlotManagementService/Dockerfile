FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/SlotManagementService/SlotManagementService.csproj", "./"]
RUN dotnet restore "./SlotManagementService.csproj"
COPY . .
WORKDIR "/src/backend/services/SlotManagementService"
RUN dotnet build "SlotManagementService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "SlotManagementService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "SlotManagementService.dll"]